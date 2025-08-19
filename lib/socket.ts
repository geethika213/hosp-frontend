import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.authenticate();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
    });

    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  private authenticate() {
    if (this.socket && this.token) {
      this.socket.emit('authenticate', { token: this.token });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat methods
  joinChat(chatId: string) {
    this.socket?.emit('join-chat', { chatId });
  }

  sendMessage(chatId: string, content: string, messageType: string = 'text') {
    this.socket?.emit('send-message', { chatId, content, messageType });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new-message', callback);
  }

  startTyping(chatId: string) {
    this.socket?.emit('typing-start', { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit('typing-stop', { chatId });
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user-typing', callback);
  }

  // Video call methods
  joinVideoRoom(roomId: string) {
    this.socket?.emit('join-video-room', { roomId });
  }

  sendVideoOffer(offer: any) {
    this.socket?.emit('video-offer', offer);
  }

  sendVideoAnswer(answer: any) {
    this.socket?.emit('video-answer', answer);
  }

  sendIceCandidate(candidate: any) {
    this.socket?.emit('ice-candidate', candidate);
  }

  onVideoOffer(callback: (data: any) => void) {
    this.socket?.on('video-offer', callback);
  }

  onVideoAnswer(callback: (data: any) => void) {
    this.socket?.on('video-answer', callback);
  }

  onIceCandidate(callback: (data: any) => void) {
    this.socket?.on('ice-candidate', callback);
  }

  onUserJoinedVideo(callback: (data: any) => void) {
    this.socket?.on('user-joined-video', callback);
  }

  onUserLeftVideo(callback: (data: any) => void) {
    this.socket?.on('user-left-video', callback);
  }

  // Notification methods
  onNewNotification(callback: (data: any) => void) {
    this.socket?.on('new_notification', callback);
  }

  onSystemAnnouncement(callback: (data: any) => void) {
    this.socket?.on('system_announcement', callback);
  }

  // Doctor status updates
  updateOnlineStatus(isOnline: boolean) {
    this.socket?.emit('update-online-status', { isOnline });
  }

  onDoctorStatusUpdated(callback: (data: any) => void) {
    this.socket?.on('doctor-status-updated', callback);
  }

  // Video call requests
  requestVideoCall(appointmentId: string) {
    this.socket?.emit('video_call_request', { appointmentId });
  }

  acceptVideoCall(appointmentId: string, roomId: string) {
    this.socket?.emit('video_call_accept', { appointmentId, roomId });
  }

  rejectVideoCall(appointmentId: string, reason?: string) {
    this.socket?.emit('video_call_reject', { appointmentId, reason });
  }

  onIncomingVideoCall(callback: (data: any) => void) {
    this.socket?.on('incoming_video_call', callback);
  }

  onVideoCallAccepted(callback: (data: any) => void) {
    this.socket?.on('video_call_accepted', callback);
  }

  onVideoCallRejected(callback: (data: any) => void) {
    this.socket?.on('video_call_rejected', callback);
  }

  onVideoCallEnded(callback: (data: any) => void) {
    this.socket?.on('video-call-ended', callback);
  }
}

export const socketService = new SocketService();
export default socketService;