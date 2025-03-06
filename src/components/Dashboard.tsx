import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Mic, FileAudio, FileText, Clock, User, 
  Calendar, Headphones, Volume2, MessageSquare 
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DashboardProps {
  username?: string;
}

const Dashboard = ({ username = "User" }: DashboardProps) => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good day");
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  
  // Get time of day for greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleCreateNewEvent = () => {
    if (newEventName.trim()) {
      // Save event name to localStorage or state management
      localStorage.setItem("currentEventName", newEventName);
      setIsNewEventModalOpen(false);
      // Navigate to recording screen
      navigate("/record");
    }
  };

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case "newEvent":
        setIsNewEventModalOpen(true);
        break;
      case "newRecording":
        navigate("/record");
        break;
      case "myAudios":
        // Navigate to audios page
        break;
      case "myPDFs":
        // Navigate to PDFs page
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* New Feature Banner */}
      <div className="flex items-center mb-8">
        <div className="bg-black text-white text-xs px-2 py-1 rounded-full mr-2">New</div>
        <span className="text-sm font-medium">Introducing Voice Cloning</span>
        <Button variant="link" className="text-sm p-0 ml-2">
          Learn more
        </Button>
      </div>

      {/* Workspace Header */}
      <div className="mb-10">
        <div className="text-sm text-gray-500 mb-1">My Workspace</div>
        <h1 className="text-3xl font-bold">
          {greeting}, {username}
        </h1>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div 
          onClick={() => handleCardClick("newEvent")}
          className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center text-center h-48"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-1">New Event</h3>
          <p className="text-sm text-gray-500">Create a new recording event</p>
        </div>

        <div 
          onClick={() => handleCardClick("newRecording")}
          className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center text-center h-48"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Mic className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-medium mb-1">New Recording</h3>
          <p className="text-sm text-gray-500">Start a new audio recording</p>
        </div>

        <div 
          onClick={() => handleCardClick("myAudios")}
          className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center text-center h-48"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <FileAudio className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-medium mb-1">My Audios</h3>
          <p className="text-sm text-gray-500">Browse your audio recordings</p>
        </div>

        <div 
          onClick={() => handleCardClick("myPDFs")}
          className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center text-center h-48"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-1">My PDFs</h3>
          <p className="text-sm text-gray-500">Access your PDF documents</p>
        </div>
      </div>

      {/* Recent Calls Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Recent Recordings</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <Headphones className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Recording {item}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(Date.now() - item * 86400000).toLocaleDateString()} • {Math.floor(Math.random() * 10) + 1}:{Math.floor(Math.random() * 50) + 10} min
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4 w-full">
          View all recordings
        </Button>
      </div>

      {/* Voices Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Voices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Natural Voice", "Professional", "Casual"].map((voice, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index === 0 ? "bg-green-100" : index === 1 ? "bg-blue-100" : "bg-yellow-100"
                }`}>
                  <MessageSquare className={`h-4 w-4 ${
                    index === 0 ? "text-green-600" : index === 1 ? "text-blue-600" : "text-yellow-600"
                  }`} />
                </div>
                <h3 className="font-medium">{voice}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {index === 0 
                  ? "A natural sounding voice for everyday use" 
                  : index === 1 
                    ? "Perfect for business presentations" 
                    : "Relaxed tone for casual content"}
              </p>
              <div className="flex">
                <Button variant="outline" size="sm" className="mr-2 text-xs">
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Event Modal */}
      <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="event-name" className="block mb-2">
              Event Name
            </Label>
            <Input
              id="event-name"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="Enter event name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEventModalOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleCreateNewEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
