import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface WebRTCCallProps {
  onCallEnd: (duration: number) => void;
}

export default function WebRTCCall({ onCallEnd }: WebRTCCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isIncoming, setIsIncoming] = useState(false);
  const [callerName, setCallerName] = useState('');
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  useEffect(() => {
    const randomIncoming = Math.random() > 0.7;
    if (randomIncoming) {
      setTimeout(() => {
        const names = ['Мария Петрова', 'Иван Сидоров', 'Елена Волкова', 'Алексей Новиков'];
        const phones = ['+7 (999) 111-22-33', '+7 (999) 222-33-44', '+7 (999) 333-44-55'];
        setCallerName(names[Math.floor(Math.random() * names.length)]);
        setPhoneNumber(phones[Math.floor(Math.random() * phones.length)]);
        setIsIncoming(true);
        toast.info('Входящий звонок!', {
          description: `От: ${names[Math.floor(Math.random() * names.length)]}`,
        });
      }, 5000);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      });
      
      localStreamRef.current = stream;
      
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        localAudioRef.current.muted = true;
      }

      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate:', event.candidate);
        }
      };

      setIsCallActive(true);
      setCallDuration(0);
      setIsIncoming(false);
      toast.success(`Звонок начат на номер ${phoneNumber || '+7 (999) 000-00-00'}`);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    setIsCallActive(false);
    toast.info(`Звонок завершён. Длительность: ${formatTime(callDuration)}`);
    onCallEnd(callDuration);
    setCallDuration(0);
    setPhoneNumber('');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      toast.info(isMuted ? 'Микрофон включен' : 'Микрофон выключен');
    }
  };

  const acceptCall = () => {
    startCall();
  };

  const rejectCall = () => {
    setIsIncoming(false);
    toast.info('Звонок отклонён');
  };

  if (isIncoming) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-600 p-6 animate-pulse">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-4 relative">
            <Icon name="Phone" size={40} className="text-blue-400" />
            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-pulse-ring"></div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Входящий звонок</h3>
          <p className="text-blue-200 text-lg mb-1">{callerName}</p>
          <p className="text-blue-300 text-sm mb-6">{phoneNumber}</p>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={rejectCall}
              className="bg-red-500 hover:bg-red-600 px-8"
              size="lg"
            >
              <Icon name="PhoneOff" size={20} className="mr-2" />
              Отклонить
            </Button>
            <Button
              onClick={acceptCall}
              className="bg-green-500 hover:bg-green-600 px-8"
              size="lg"
            >
              <Icon name="Phone" size={20} className="mr-2" />
              Принять
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!isCallActive) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Совершить звонок</h3>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="+7 (999) 123-45-67"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white text-lg"
            />
          </div>
          <Button
            onClick={startCall}
            className="w-full bg-green-500 hover:bg-green-600"
            size="lg"
          >
            <Icon name="Phone" size={20} className="mr-2" />
            Позвонить
          </Button>
          <p className="text-xs text-slate-500 text-center">
            Для звонка требуется разрешение на доступ к микрофону
          </p>
        </div>

        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-600 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Icon name="Phone" size={32} className="text-green-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-500/30 animate-pulse-ring"></div>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Активный звонок</p>
              <p className="text-green-200">{phoneNumber || '+7 (999) 000-00-00'}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-4xl font-mono font-bold text-white">{formatTime(callDuration)}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={toggleMute}
            variant="outline"
            size="lg"
            className={`${isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-700/50 border-slate-600 text-white'}`}
          >
            <Icon name={isMuted ? 'MicOff' : 'Mic'} size={20} />
          </Button>
          
          <Button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 px-8"
            size="lg"
          >
            <Icon name="PhoneOff" size={20} className="mr-2" />
            Завершить звонок
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-green-300">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>Идёт разговор</span>
        </div>
      </div>

      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </Card>
  );
}
