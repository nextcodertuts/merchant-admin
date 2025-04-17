/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { type Router } from "next/navigation";

export type CommandAction = (router: Router, params?: string) => void;
export type CommandPattern = string;
export type ShowHelpFunction = () => void;

export interface Command {
  patterns: CommandPattern[];
  action: CommandAction;
  description: string;
}

export interface CommandsWithHelp extends Record<string, Command> {
  HELP: {
    patterns: CommandPattern[];
    action: (showHelp: ShowHelpFunction) => void;
    description: string;
  };
}

export const messages = {
  listening: {
    "en-US": "Listening...",
    "hi-IN": "सुन रहा हूँ...",
    "bn-IN": "শোনা হচ্ছে...",
  },
  recognizedSpeech: {
    "en-US": "Recognized Speech",
    "hi-IN": "पहचाना गया वाक्य",
    "bn-IN": "স্বীকৃত বক্তৃতা",
  },
  commandNotRecognized: {
    "en-US": "Command not recognized.",
    "hi-IN": "कमांड समझ नहीं आया।",
    "bn-IN": "কমান্ড বোঝা যায়নি।",
  },
  voiceCommands: {
    "en-US": "Voice Commands",
    "hi-IN": "वॉइस कमांड्स",
    "bn-IN": "ভয়েস কমান্ড",
  },
  availableCommands: {
    "en-US": "Here are the available commands you can say:",
    "hi-IN": "आप ये कमांड्स बोल सकते हैं:",
    "bn-IN": "আপনি এই কমান্ডগুলি বলতে পারেন:",
  },
  say: {
    "en-US": "Say: ",
    "hi-IN": "बोलें: ",
    "bn-IN": "বলুন: ",
  },
  or: {
    "en-US": " or ",
    "hi-IN": " या ",
    "bn-IN": " অথবা ",
  },
};

// Optional: filter by language
export const filterPatternsByLanguage = (patterns: string[], lang: string) => {
  const langPrefix = lang.startsWith("hi")
    ? "hi"
    : lang.startsWith("bn")
    ? "bn"
    : "en";
  return patterns.filter((p) =>
    langPrefix === "en"
      ? /^[a-zA-Z\s]+$/.test(p)
      : langPrefix === "hi"
      ? /[\u0900-\u097F]/.test(p)
      : /[\u0980-\u09FF]/.test(p)
  );
};

export const isHelpCommand = (text: string): boolean => {
  return ["help", "मदद", "সাহায্য"].includes(text.trim().toLowerCase());
};

export const extractSearchTerm = (
  text: string,
  lang: string
): string | null => {
  const keyword = lang.startsWith("hi")
    ? "खोजो"
    : lang.startsWith("bn")
    ? "সার্চ"
    : "search";
  const idx = text.toLowerCase().indexOf(keyword);
  return idx !== -1 ? text.slice(idx + keyword.length).trim() : null;
};

export const getCommands = (
  showHelpFn?: ShowHelpFunction
): CommandsWithHelp => ({
  DASHBOARD: {
    patterns: [
      "go to dashboard",
      "open dashboard",
      "डैशबोर्ड पर जाएं",
      "डैशबोर्ड खोलें",
      "डैशबोर्ड दिखाओ",
      "ড্যাশবোর্ডে যান",
      "ড্যাশবোর্ড দেখান",
      "ড্যাশবোর্ড খুলুন",
      "ড্যাশবোর্ড দেখাও",
      "বোর্ড দেখাও",
    ],
    action: (router) => router.push("/dashboard"),
    description: "Opens the dashboard",
  },
  INVOICES: {
    patterns: [
      "show invoices",
      "view invoices",
      "go to invoices",
      "इनवॉइस दिखाओ",
      "बिल दिखाओ",
      "इनवॉइस दिखाइए",
      "इनवॉइस पर जाएं",
      "ইনভয়েস দেখাও",
      "বিল দেখাও",
      "ইনভয়েসে যান",
    ],
    action: (router) => router.push("/dashboard/invoices"),
    description: "Shows all invoices",
  },
  CLIENTS: {
    patterns: [
      "show clients",
      "go to clients",
      "क्लाइंट दिखाओ",
      "कस्टमर दिखाओ",
      "कस्टमर दिखाइए",
      "ग्राहक खोलो",
      "ক্লায়েন্ট দেখাও",
      "কাস্টমার দেখাও",
    ],
    action: (router) => router.push("/dashboard/clients"),
    description: "Shows all clients",
  },
  EXPENSES: {
    patterns: [
      "show expenses",
      "view expenses",
      "खर्च दिखाओ",
      "खर्च खोलें",
      "খরচ দেখাও",
      "খরচ খুলুন",
      "এক্সপেন্স দেখাও",
    ],
    action: (router) => router.push("/dashboard/expenses"),
    description: "Shows all expenses",
  },
  PRODUCTS: {
    patterns: [
      "show products",
      "view products",
      "उत्पाद दिखाओ",
      "प्रोडक्ट दिखाओ",
      "सभी प्रोडक्ट खोलो",
      "प्रोडक्ट दिखाइए",
      "সব প্রোডাক্ট দেখাও",
      "পণ্য দেখাও",
      "প্রোডাক্ট দেখাও",
    ],
    action: (router) => router.push("/dashboard/products"),
    description: "Shows all products",
  },
  CREATE_INVOICE: {
    patterns: [
      "create invoice",
      "make invoice",
      "बिल बनाओ",
      "नया बिल बनाओ",
      "इनवॉइस बनाओ",
      "इनवॉइस बनाओ",
      "ইনভয়েস তৈরি করো",
      "বিল বানাও",
      "বিল ক্রিয়েট করো",
      "নতুন ",
      "তৈরি করো",
    ],
    action: (router) => router.push("/dashboard/invoices/create"),
    description: "Creates a new invoice",
  },
  ADD_CLIENT: {
    patterns: [
      "add client",
      "new client",
      "ग्राहक जोड़ो",
      "क्लाइंट जोड़ो",
      "नया ग्राहक",
      "কাস্টমার যোগ করো",
      "নতুন ক্লায়েন্ট",
      "নতুন কাস্টমার",
    ],
    action: (router) => router.push("/dashboard/clients/create"),
    description: "Adds a new client",
  },
  ADD_PRODUCT: {
    patterns: [
      "add product",
      "new product",
      "प्रोडक्ट जोड़ो",
      "प्रोडक्ट ऐड करो",
      "नया माल जोड़ो",
      "नया उत्पाद जोड़ो",
      "পণ্য যোগ করো",
      "নতুন প্রোডাক্ট",
      "নতুন পণ্য",
    ],
    action: (router) => router.push("/dashboard/products/create"),
    description: "Adds a new product",
  },
  ADD_EXPENSE: {
    patterns: [
      "add expense",
      "new expense",
      "खर्च जोड़ो",
      "एक्सपेंस ऐड करो",
      "खर्च लिखो",
      "खर्चा ऐड करो",
      "नया खर्च जोड़ो",
      "খরচ যোগ করো",
      "খরচ লিখো",
      "নতুন খরচ",
      "অ্যাড করো",
    ],
    action: (router) => router.push("/dashboard/expenses/create"),
    description: "Adds a new expense",
  },
  HELP: {
    patterns: ["help", "मदद", "সাহায্য"],
    action: (showHelp) => showHelp(),
    description: "Shows help instructions",
  },
});
