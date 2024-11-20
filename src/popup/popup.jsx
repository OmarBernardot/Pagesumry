import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import {
  Loader2,
  Sparkles,
  FileText,
  MessageSquare,
  Copy,
  VolumeIcon as VolumeUp,
  Expand,
} from "lucide-react";

export default function Popup() {
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const response = await chrome.runtime.sendMessage({
        action: "summarize",
        url: tab.url,
      });
      setSummary(response.summary);
    } catch (error) {
      console.error("Error summarizing:", error);
      setSummary("An error occurred while summarizing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const response = await chrome.runtime.sendMessage({
        action: "ask",
        url: tab.url,
        question: question,
      });
      setAnswer(response.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("An error occurred while processing your question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary || answer);
  };

  const handleReadAloud = () => {
    const textToRead = summary || answer;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    window.speechSynthesis.speak(utterance);
  };

  const handleExpand = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("expanded.html") });
  };

  return (
    <Card className="w-[400px] h-[500px] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
      <CardHeader className="bg-white/50 backdrop-blur-sm">
        <CardTitle className="text-2xl font-bold text-indigo-700">
          PageSumry
        </CardTitle>
        <CardDescription className="text-indigo-600">
          AI-powered summaries and answers
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="summary" className="h-[calc(100%-5rem)]">
        <TabsList className="grid w-full grid-cols-2 p-2 bg-white/30 backdrop-blur-sm">
          <TabsTrigger
            value="summary"
            className="flex items-center justify-center space-x-2 p-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-md transition-all duration-200 ease-in-out"
          >
            <FileText className="w-5 h-5" />
            <span>Summarize</span>
          </TabsTrigger>
          <TabsTrigger
            value="ask"
            className="flex items-center justify-center space-x-2 p-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-md transition-all duration-200 ease-in-out"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Ask</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="h-[calc(100%-3.5rem)] p-4">
          <Button
            onClick={handleSummarize}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Generate AI Summary
          </Button>
          <ScrollArea className="h-[calc(100%-4rem)] mt-4 rounded-lg bg-white/50 backdrop-blur-sm p-4">
            {summary ? (
              <div className="prose prose-sm max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: summary
                      .replace(/^# (.*$)/gim, "<h2>$1</h2>")
                      .replace(/^## (.*$)/gim, "<h3>$1</h3>")
                      .replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>")
                      .replace(/^(\d+\. )(.*$)/gim, "<ol><li>$2</li></ol>")
                      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
                      .replace(/\n/gim, "<br>"),
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                Click the button above to generate a summary of the current
                webpage.
              </p>
            )}
          </ScrollArea>
          {summary && (
            <div className="flex justify-end space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleReadAloud}>
                <VolumeUp className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleExpand}>
                <Expand className="w-4 h-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="ask" className="h-[calc(100%-3.5rem)] p-4">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-grow"
              />
              <Button
                onClick={handleAsk}
                className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ask"
                )}
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-4rem)] rounded-lg bg-white/50 backdrop-blur-sm p-4">
              {answer ? (
                <p className="text-sm text-gray-700">{answer}</p>
              ) : (
                <p className="text-sm text-gray-700">
                  Ask a question about the current webpage.
                </p>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
