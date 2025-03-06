import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Brain, Sparkles, Check, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface AIProviderSelectorProps {
  selectedProvider?: string;
  apiKey?: string;
  onProviderChange?: (provider: string) => void;
  onApiKeyChange?: (apiKey: string) => void;
  className?: string;
}

const AIProviderSelector = ({
  selectedProvider = "openai",
  apiKey = "",
  onProviderChange = () => {},
  onApiKeyChange = () => {},
  className = "",
}: AIProviderSelectorProps) => {
  const providers = [
    { id: "openai", name: "OpenAI" },
    { id: "azure", name: "Azure AI" },
    { id: "google", name: "Google AI" },
    { id: "elevenlabs", name: "ElevenLabs" },
    { id: "anthropic", name: "Anthropic" },
    { id: "deepseek", name: "DeepSeek" },
  ];

  return (
    <Card
      className={`w-full max-w-md bg-white shadow-md border border-gray-100 rounded-3xl overflow-hidden ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <span className="text-[#513d2f]">Provedor de IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedProvider}
            onValueChange={(value) => {
              onProviderChange(value);
              localStorage.setItem("aiProvider", value);
            }}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800">
              <SelectValue placeholder="Selecione o provedor de IA" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-100">
              {providers.map((provider) => (
                <SelectItem
                  key={provider.id}
                  value={provider.id}
                  className="text-gray-700 hover:text-[#ff6600] hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {provider.id === "openai" && (
                      <Sparkles className="h-4 w-4 text-green-500" />
                    )}
                    {provider.id === "google" && (
                      <Brain className="h-4 w-4 text-blue-500" />
                    )}
                    {provider.id === "elevenlabs" && (
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    )}
                    {provider.id === "anthropic" && (
                      <Brain className="h-4 w-4 text-pink-500" />
                    )}
                    {provider.id === "azure" && (
                      <Brain className="h-4 w-4 text-blue-600" />
                    )}
                    {provider.id === "deepseek" && (
                      <Brain className="h-4 w-4 text-yellow-500" />
                    )}
                    {provider.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm text-gray-700">
              Chave de API
            </Label>
            <div className="flex space-x-2">
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  onApiKeyChange(e.target.value);
                  localStorage.setItem("apiKey", e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Insira sua chave de API"
              />
              {selectedProvider === "google" && (
                <Button
                  variant="outline"
                  className="h-10 px-3 flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() =>
                    window.open("https://aistudio.google.com/app/apikey", "_blank")
                  }
                >
                  <ExternalLink size={14} />
                  <span>Get API Key</span>
                </Button>
              )}
            </div>
            {selectedProvider === "google" && (
              <p className="text-xs text-gray-500 mt-1">
                Obtenha sua chave de API do Google AI Studio para usar o Gemini
                para transcrição e tradução.
              </p>
            )}
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              A chave de API é necessária para acessar os serviços de tradução
              do provedor selecionado. Suas chaves são armazenadas localmente e
              nunca compartilhadas.
            </p>
            <Button
              onClick={() => {
                // Salvar configurações
                localStorage.setItem("aiProvider", selectedProvider);
                localStorage.setItem("apiKey", apiKey);

                // Mostrar confirmação visual
                const button = document.getElementById("confirm-button");
                if (button) {
                  button.classList.add("bg-green-500");
                  button.innerHTML =
                    "<span class='flex items-center'><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='mr-1'><polyline points='20 6 9 17 4 12'></polyline></svg> Salvo</span>";

                  setTimeout(() => {
                    button.classList.remove("bg-green-500");
                    button.innerHTML = "Confirmar";
                  }, 2000);
                }

                // Recarregar a página para aplicar as configurações
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
              id="confirm-button"
              className="ml-2 bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs px-3 py-1 rounded-md transition-colors"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProviderSelector;
