export type OpenAICompletionRequestBody = {
  model: "gpt-4o-mini";
  messages: {
    role: "system" | "user";
    content: string;
  }[];
};

export type OpenAICompletionResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};
