/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, HelpCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getCommands,
  isHelpCommand,
  extractSearchTerm,
  filterPatternsByLanguage,
  messages,
  type CommandsWithHelp,
} from "@/lib/voice-commands";

export function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const router = useRouter();

  const commands: CommandsWithHelp = getCommands(() => setShowHelp(true));

  const processCommand = useCallback(
    (text: string) => {
      const lowerText = text.toLowerCase().trim();

      if (isHelpCommand(lowerText)) {
        setShowHelp(true);
        return;
      }

      for (const [key, command] of Object.entries(commands)) {
        if (
          command.patterns.some((pattern) =>
            lowerText.includes(pattern.toLowerCase())
          )
        ) {
          if (key.startsWith("SEARCH_")) {
            const searchTerm = extractSearchTerm(lowerText, language);
            if (searchTerm) {
              command.action(router, encodeURIComponent(searchTerm));
              toast.success(`Searching for "${searchTerm}"`);
              return;
            }
          } else {
            command.action(router);
            toast.success(`✅ ${command.description}`);
            return;
          }
        }
      }

      const phoneMatch = lowerText.match(/(\d{10})/);
      if (phoneMatch) {
        router.push(`/dashboard/clients?search=${phoneMatch[1]}`);
        toast.success(`Searching for client with phone: ${phoneMatch[1]}`);
        return;
      }

      toast.error(messages.commandNotRecognized[language]);
    },
    [router, language, commands]
  );

  const startListening = () => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      toast.info(messages.listening[language]);
    };

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(interimTranscript);

      if (event.results[0].isFinal) {
        processCommand(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      toast.error(messages.recognitionFailed?.[language] || "Error occurred");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      <div className="fixed bottom-7 right-4 z-50 flex items-center gap-2">
        <select
          className="h-10 rounded-md border px-3 py-2 text-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="bn-IN">Bengali</option>
        </select>

        <Button
          size="lg"
          className={`rounded-full p-4 ${isListening ? "bg-red-500" : ""}`}
          onClick={startListening}
          disabled={isListening}
        >
          {isListening ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setShowHelp(true)}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      {showHelp && (
        <div className="fixed bottom-20 right-4 z-50 w-96 rounded-lg bg-background p-4 shadow-lg">
          <h3 className="font-semibold text-lg">
            {messages.voiceCommands[language]}
          </h3>
          <X
            className="absolute right-1 top-3"
            onClick={() => setShowHelp(false)}
          />
          <p className="text-sm mb-2">{messages.availableCommands[language]}</p>
          <ul className="text-sm list-disc ml-4">
            {Object.entries(commands).map(([key, command]) => (
              <li key={key}>
                <strong>{command.description}:</strong>{" "}
                {filterPatternsByLanguage(command.patterns, language).join(
                  messages.or[language]
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {transcript && (
        <div className="fixed bottom-32 right-4 z-50 w-64 rounded-lg bg-background p-4 shadow-lg">
          <X
            className="absolute right-1 top-3"
            onClick={() => setTranscript("")}
          />
          <p className="text-sm font-medium">
            {messages.recognizedSpeech[language]}
          </p>
          <p className="text-sm text-muted-foreground">{transcript}</p>
        </div>
      )}
    </>
  );
}
