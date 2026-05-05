export type OpenAICompletionRequestBody = {
  model: "gpt-4.1-nano";
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
