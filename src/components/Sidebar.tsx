import React, { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Settings,
  History,
  Bookmark,
  FileText,
  ChevronLeft,
  ChevronRight,
  Mic,
  Volume2,
  Languages,
  Clock,
  Save,
  Trash2,
  Download,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNoiseReductionChange?: (enabled: boolean) => void;
  onMicSensitivityChange?: (level: number) => void;
  onAutoDetectLanguageChange?: (enabled: boolean) => void;
  onAutoSaveChange?: (enabled: boolean) => void;
  onSaveIntervalChange?: (minutes: number) => void;
}

const Sidebar = ({
  collapsed = false,
  onToggleCollapse = () => {},
  onNoiseReductionChange = () => {},
  onMicSensitivityChange = () => {},
  onAutoDetectLanguageChange = () => {},
  onAutoSaveChange = () => {},
  onSaveIntervalChange = () => {},
}: SidebarProps) => {
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(75);
  const [saveInterval, setSaveInterval] = useState(5);
  const [activeTab, setActiveTab] = useState<string>("audio");

  const handleNoiseReductionChange = (checked: boolean) => {
    setNoiseReduction(checked);
    onNoiseReductionChange(checked);
  };

  const handleMicSensitivityChange = (value: number) => {
    setMicSensitivity(value);
    onMicSensitivityChange(value);
  };

  const handleAutoDetectLanguageChange = (checked: boolean) => {
    setAutoDetectLanguage(checked);
    onAutoDetectLanguageChange(checked);
  };

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    onAutoSaveChange(checked);
  };

  const handleSaveIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSaveInterval(value);
    onSaveIntervalChange(value);
  };

  // Mock recent transcriptions data
  const recentTranscriptions = [
    { id: "1", title: "Reunião de Equipe", date: new Date(), duration: 1800 },
    {
      id: "2",
      title: "Entrevista",
      date: new Date(Date.now() - 86400000),
      duration: 2400,
    },
    {
      id: "3",
      title: "Notas Pessoais",
      date: new Date(Date.now() - 259200000),
      duration: 600,
    },
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`h-full bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? "w-16" : "w-72"}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900">
              Configurações
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="ml-auto text-gray-500 hover:text-[#ff6600]"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <Separator />

        <div className="flex-1 overflow-auto p-4">
          {collapsed ? (
            <div className="flex flex-col items-center space-y-6">
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "audio" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("audio")}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "language" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("language")}
              >
                <Languages className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "voice" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("voice")}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "history" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("history")}
              >
                <History className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "saved" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("saved")}
              >
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "export" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("export")}
              >
                <FileText className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${activeTab === "settings" ? "bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]" : "text-gray-500 hover:text-[#ff6600]"}`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Audio Settings Section */}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <Mic className="h-4 w-4" /> Configurações de Áudio
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="noise-reduction"
                        className="text-sm text-gray-700"
                      >
                        Redução de Ruído
                      </Label>
                      <Switch
                        id="noise-reduction"
                        checked={noiseReduction}
                        onCheckedChange={handleNoiseReductionChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="mic-sensitivity"
                          className="text-sm text-gray-700"
                        >
                          Sensibilidade do Microfone
                        </Label>
                        <span className="text-xs text-gray-500">
                          {micSensitivity}%
                        </span>
                      </div>
                      <Slider
                        id="mic-sensitivity"
                        value={[micSensitivity]}
                        max={100}
                        step={1}
                        onValueChange={(vals) =>
                          handleMicSensitivityChange(vals[0])
                        }
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Testar Microfone
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Language Settings */}
              {activeTab === "language" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <Languages className="h-4 w-4" /> Configurações de Idioma
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="auto-detect"
                        className="text-sm text-gray-700"
                      >
                        Detectar Idioma Automaticamente
                      </Label>
                      <Switch
                        id="auto-detect"
                        checked={autoDetectLanguage}
                        onCheckedChange={handleAutoDetectLanguageChange}
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <Label className="text-sm text-gray-700">
                        Idiomas Favoritos
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {["🇧🇷 PT", "🇺🇸 EN", "🇪🇸 ES"].map((lang) => (
                          <div
                            key={lang}
                            className="px-3 py-1 bg-[#ff6600]/10 text-[#ff6600] rounded-full text-xs flex items-center"
                          >
                            {lang}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full h-6 w-6 p-0 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* History & Saved */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <History className="h-4 w-4" /> Histórico & Salvos
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="auto-save"
                        className="text-sm text-gray-700"
                      >
                        Salvar Automaticamente
                      </Label>
                      <Switch
                        id="auto-save"
                        checked={autoSave}
                        onCheckedChange={handleAutoSaveChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="save-interval"
                        className="text-sm text-gray-700"
                      >
                        Intervalo de Salvamento
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="save-interval"
                          type="number"
                          min="1"
                          max="60"
                          value={saveInterval}
                          onChange={handleSaveIntervalChange}
                          className="w-20 bg-white border-gray-200 text-gray-800"
                        />
                        <span className="text-sm text-gray-500">minutos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Transcriptions */}
              {activeTab === "saved" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <Clock className="h-4 w-4" /> Transcrições Recentes
                  </h3>
                  <div className="space-y-2">
                    {recentTranscriptions.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex flex-col p-3 hover:bg-gray-100 hover:text-gray-900 rounded-md cursor-pointer border border-gray-200 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">
                            {item.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDuration(item.duration)}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-500 hover:text-[#ff6600]"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-500 hover:text-[#ff6600]"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                    >
                      Ver Todas as Transcrições
                    </Button>
                  </div>
                </div>
              )}

              {/* Voice Settings */}
              {activeTab === "voice" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <Volume2 className="h-4 w-4" /> Síntese de Voz
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="voice-enabled"
                        className="text-sm text-gray-700"
                      >
                        Ativar Síntese de Voz
                      </Label>
                      <Switch id="voice-enabled" checked={true} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">
                        Tipo de Voz
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                        >
                          <span className="text-xs">🧑 Masculina</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]"
                        >
                          <span className="text-xs">👩 Feminina</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="voice-speed"
                          className="text-sm text-gray-700"
                        >
                          Velocidade da Fala
                        </Label>
                        <span className="text-xs text-gray-500">Normal</span>
                      </div>
                      <Slider
                        id="voice-speed"
                        value={[50]}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Export Settings */}
              {activeTab === "export" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <FileText className="h-4 w-4" /> Exportação
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="include-translation"
                        className="text-sm text-gray-700"
                      >
                        Incluir Tradução
                      </Label>
                      <Switch id="include-translation" checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="include-timestamps"
                        className="text-sm text-gray-700"
                      >
                        Incluir Marcadores de Tempo
                      </Label>
                      <Switch id="include-timestamps" checked={false} />
                    </div>

                    <div className="pt-2">
                      <Label className="text-sm mb-2 block text-gray-700">
                        Formato Padrão
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#ff6600] text-white shadow-[0_0_10px_rgba(255,102,0,0.3)]"
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                        >
                          TXT
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                        >
                          DOCX
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-gray-900">
                    <Settings className="h-4 w-4" /> Configurações Gerais
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="auto-update"
                        className="text-sm text-gray-700"
                      >
                        Atualizações Automáticas
                      </Label>
                      <Switch id="auto-update" checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="analytics"
                        className="text-sm text-gray-700"
                      >
                        Enviar Dados de Uso
                      </Label>
                      <Switch id="analytics" checked={false} />
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                      >
                        Limpar Todos os Dados
                      </Button>
                    </div>

                    <div className="pt-1">
                      <p className="text-xs text-gray-500 mt-2">
                        Versão 1.0.0 • Última atualização: hoje
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        <div className="p-4">
          {!collapsed && (
            <Button
              variant="outline"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações Avançadas
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
