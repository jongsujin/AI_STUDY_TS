import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";

dotenv.config();

// OpenAI 객체 생성 (GPT-4 모델) + 스트리밍 활성화
const chatOpenAI = new ChatOpenAI({
  modelName: "gpt-4", // Chat 모델 지정
  openAIApiKey: process.env.OPENAI_API_KEY, // .env 파일에서 API 키 불러오기
  streaming: true, // 스트리밍 활성화
  callbacks: [
    {
      handleLLMNewToken: async (token: string) => {
        process.stdout.write(token); // 새로운 토큰이 생성될 때마다 출력
      },
    },
  ],
});

// 대화 시작을 위한 기본 메시지 템플릿 설정
const template = new PromptTemplate({
  template: `안녕하세요 {name}님, 무엇을 도와드릴까요?`,
  inputVariables: ["name"],
});

// 대화 함수 정의 (비동기)
const startConversation = async (name: string, userQuestion: string) => {
  // 1. 시스템 초기 메시지
  const systemMessage = new SystemMessage("당신은 친절한 가상 비서입니다.");

  // 2. 사용자에게 인사하는 메시지 생성
  const greetingMessage = await template.format({ name });

  // 3. 사용자 메시지
  const userMessage = new HumanMessage(userQuestion);

  // 4. 대화 메시지 배열로 전달 (GPT-4는 대화형 모델)
  const messages = [
    systemMessage,
    new AIMessage(greetingMessage), // 인사 메시지
    userMessage,
  ];

  // 5. OpenAI 모델로부터 스트리밍 응답 생성
  await chatOpenAI.call(messages); // ChatOpenAI로 대화 메시지 전달
};

// 대화 시작 예시
const userName = "진종수"; // 사용자의 이름
const userQuestion = "지금 날씨를 알려줘"; // 사용자의 질문

startConversation(userName, userQuestion).catch(console.error);
