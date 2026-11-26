import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { buildFeeSummaryForPrompt, MUSEUM_INFO } from './src/data/rentalFees';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 서버 환경에 설정되어 있지 않습니다.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
}

interface GroundingPlace {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/maps-config', (_req, res) => {
    const apiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.json({ apiKey });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body as { messages?: ChatMessagePayload[] };
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: '대화 내용이 비어 있습니다.' });
        return;
      }

      const sanitized = messages
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'model') &&
            typeof m.text === 'string' &&
            m.text.trim().length > 0
        )
        .slice(-20);

      if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
        res.status(400).json({ error: '올바른 사용자 질문이 필요합니다.' });
        return;
      }

      const ai = getGeminiClient();
      const historyMessages = sanitized.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      const latestMessage = sanitized[sanitized.length - 1].text;

      const systemInstruction = `당신은 '천안박물관 시설 대관 안내 도우미'입니다.
공공기관 안내원으로서 정중하고, 명확하고, 읽기 쉬운 한국어(존댓말)로 답변하세요.

[답변 원칙]
1. 아래 공식 대관 기준 데이터만을 근거로 정확하게 안내하세요. 추측이나 임의 할인은 하지 마세요.
2. 사용자가 요금 계산을 물으면 항목별로 곱셈/합계를 알기 쉽게 풀어서 계산해주고, 마지막에 반드시 "예상 금액이며, 최종 사용료는 사용허가 시 확정됩니다."라고 안내하세요.
3. 사용자의 이름, 연락처, 주민등록번호, 이메일 등 개인정보를 절대로 묻거나 입력하도록 요구하지 마세요.
4. 접수는 온라인이 아니라 방문 접수(선착순, 1일 1단체)이며, 일정 확정 및 세부 협의는 관리팀(${MUSEUM_INFO.phone})으로 전화 문의하도록 안내하세요.
5. 모바일에서 읽기 좋게 핵심 위주로 간결한 문단과 목록으로 정리하세요.

${buildFeeSummaryForPrompt()}`;

      const chat = ai.chats.create({
        model: MODEL_NAME,
        history: historyMessages,
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({
        message: latestMessage,
      });

      const text = response.text?.trim();
      if (!text) {
        res.status(502).json({ error: '응답을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
        return;
      }

      res.json({ text });
    } catch (error: unknown) {
      console.error('Gemini /api/chat error:', error);
      const errObj = error as { status?: number; message?: string };
      const status = typeof errObj?.status === 'number' && errObj.status >= 400 ? errObj.status : 500;
      res.status(status).json({
        error: errObj?.message || 'AI 안내 응답 중 오류가 발생했습니다.',
      });
    }
  });

  app.post('/api/maps-info', async (req, res) => {
    try {
      const { query, lat, lng } = req.body as {
        query?: string;
        lat?: number;
        lng?: number;
      };

      const trimmedQuery = (query || '').trim();
      if (!trimmedQuery) {
        res.status(400).json({ error: '조회할 위치 질문을 입력해 주세요.' });
        return;
      }

      const latitude =
        typeof lat === 'number' && Number.isFinite(lat)
          ? lat
          : MUSEUM_INFO.coordinates.latitude;
      const longitude =
        typeof lng === 'number' && Number.isFinite(lng)
          ? lng
          : MUSEUM_INFO.coordinates.longitude;

      const ai = getGeminiClient();
      const prompt = `대상 장소: 충청남도 천안시 동남구 천안대로 429-13 (삼룡동) 천안박물관
사용자 질문: ${trimmedQuery}

Google Maps 정보를 바탕으로 천안박물관의 위치, 찾아오는 길, 주차 또는 주변 시설에 대해 한국어로 명확하고 친절하게 안내해 주세요.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude,
                longitude,
              },
            },
          },
        },
      });

      const rawChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

      const places: GroundingPlace[] = [];
      const seenUris = new Set<string>();

      for (const chunk of rawChunks) {
        const mapsData = (chunk as {
          maps?: {
            uri?: string;
            title?: string;
            placeAnswerSources?: {
              reviewSnippets?: Array<{ content?: string; text?: string } | string>;
            };
          };
        }).maps;

        if (mapsData?.uri && !seenUris.has(mapsData.uri)) {
          seenUris.add(mapsData.uri);
          const snippets: string[] = [];
          const rawSnippets = mapsData.placeAnswerSources?.reviewSnippets;
          if (Array.isArray(rawSnippets)) {
            for (const s of rawSnippets) {
              if (typeof s === 'string' && s.trim()) {
                snippets.push(s.trim());
              } else if (s && typeof s === 'object') {
                const snippetText = s.content || s.text;
                if (typeof snippetText === 'string' && snippetText.trim()) {
                  snippets.push(snippetText.trim());
                }
              }
            }
          }
          places.push({
            title: mapsData.title || 'Google 지도에서 보기',
            uri: mapsData.uri,
            reviewSnippets: snippets.length > 0 ? snippets.slice(0, 2) : undefined,
          });
        }
      }

      res.json({
        text: response.text?.trim() || '위치 정보를 불러왔습니다.',
        places,
      });
    } catch (error: unknown) {
      console.error('Gemini /api/maps-info error:', error);
      const errObj = error as { status?: number; message?: string };
      const status = typeof errObj?.status === 'number' && errObj.status >= 400 ? errObj.status : 500;
      res.status(status).json({
        error: errObj?.message || 'Google 지도 정보를 불러오는 중 오류가 발생했습니다.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
