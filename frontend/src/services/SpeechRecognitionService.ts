// 定义SpeechRecognition接口
interface SpeechRecognitionEvent extends Event {
  results: Array<{
    [index: number]: {
      transcript: string;
      confidence: number;
    };
  }>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// 扩展Window接口
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// 语音识别服务
class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    // 检查浏览器是否支持语音识别
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'zh-CN'; // 设置为中文识别
      }
    }
  }

  /**
   * 开始语音识别
   * @param onResult 识别结果回调函数
   * @param onError 错误回调函数
   */
  startListening(onResult: (text: string) => void, onError?: (error: any) => void): void {
    if (!this.recognition) {
      console.error('浏览器不支持语音识别功能');
      onError?.('浏览器不支持语音识别功能');
      return;
    }

    if (this.isListening) return;

    this.isListening = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // 添加安全检查
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      }
      this.isListening = false;
    };

    this.recognition.onerror = (error: SpeechRecognitionErrorEvent) => {
      console.error('语音识别错误:', error);
      onError?.(error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      onError?.(error);
      this.isListening = false;
    }
  }

  /**
   * 停止语音识别
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * 检查是否支持语音识别
   */
  isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * 语音合成（文字转语音）
   * @param text 要合成的文字
   * @param onEnd 合成结束回调
   */
  speak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      console.error('浏览器不支持语音合成');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.onend = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

// 导出单例实例
export const speechRecognitionService = new SpeechRecognitionService();