import React, { useState, useRef, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

interface VideoCallProps {
  isActive: boolean
  onEnd: () => void
  partnerName: string
}

const VideoCall: React.FC<VideoCallProps> = ({ isActive, onEnd, partnerName }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isActive) {
      startCall()
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    } else {
      stopCall()
    }
  }, [isActive])

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      streamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  const stopCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCallDuration(0)
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        
        {/* Call Info */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
            <h3 className="font-semibold">{partnerName}</h3>
            <p className="text-sm opacity-75">{formatDuration(callDuration)}</p>
          </div>
        </div>

        {/* Local Video */}
        <div className="absolute bottom-20 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-75 p-6">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          <button
            onClick={onEnd}
            className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCall