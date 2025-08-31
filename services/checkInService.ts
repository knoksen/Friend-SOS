interface CheckIn {
    id: string;
    userId: string;
    scheduledTime: Date;
    interval: number; // in minutes
    endTime?: Date;
    message: string;
    contacts: string[]; // Array of contact IDs
    lastResponseTime?: Date;
    status: 'active' | 'completed' | 'cancelled' | 'failed';
    responseRequired: boolean;
    escalationDelay: number; // minutes to wait before escalating
    notificationsSent: number;
    maxNotifications: number;
    customEscalationMessage?: string;
}

interface CheckInResponse {
    checkInId: string;
    responseTime: Date;
    status: 'safe' | 'help' | 'emergency';
    location?: { latitude: number; longitude: number; };
    message?: string;
}

export class CheckInService {
    private static instance: CheckInService;
    private readonly STORAGE_KEY = 'friendsos_checkins';
    private checkIns: Map<string, CheckIn> = new Map();
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private readonly MAX_NOTIFICATIONS = 3;
    private readonly DEFAULT_ESCALATION_DELAY = 5; // 5 minutes

    private constructor() {
        this.loadCheckIns();
        this.initializeTimers();
        window.addEventListener('beforeunload', () => this.saveCheckIns());
    }

    public static getInstance(): CheckInService {
        if (!CheckInService.instance) {
            CheckInService.instance = new CheckInService();
        }
        return CheckInService.instance;
    }

    private loadCheckIns(): void {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const checkIns: CheckIn[] = JSON.parse(stored, (key, value) => {
                if (key === 'scheduledTime' || key === 'endTime' || key === 'lastResponseTime') {
                    return value ? new Date(value) : undefined;
                }
                return value;
            });

            checkIns.forEach(checkIn => {
                if (checkIn.status === 'active') {
                    this.checkIns.set(checkIn.id, checkIn);
                }
            });
        }
    }

    private saveCheckIns(): void {
        const checkInsArray = Array.from(this.checkIns.values());
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(checkInsArray));
    }

    private initializeTimers(): void {
        this.checkIns.forEach((checkIn) => {
            if (checkIn.status === 'active') {
                this.scheduleNextCheck(checkIn);
            }
        });
    }

    private scheduleNextCheck(checkIn: CheckIn): void {
        // Clear existing timer if any
        if (this.timers.has(checkIn.id)) {
            clearTimeout(this.timers.get(checkIn.id));
            this.timers.delete(checkIn.id);
        }

        const now = new Date();
        const nextCheckTime = new Date(Math.max(
            checkIn.scheduledTime.getTime(),
            checkIn.lastResponseTime ? checkIn.lastResponseTime.getTime() + checkIn.interval * 60000 : 0
        ));

        if (checkIn.endTime && nextCheckTime > checkIn.endTime) {
            this.completeCheckIn(checkIn.id);
            return;
        }

        const delay = Math.max(0, nextCheckTime.getTime() - now.getTime());
        const timer = setTimeout(() => this.processCheckIn(checkIn), delay);
        this.timers.set(checkIn.id, timer);
    }

    private async processCheckIn(checkIn: CheckIn): Promise<void> {
        if (checkIn.status !== 'active') return;

        // Request notification permission if not granted
        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission denied');
            }
        }

        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('Check-in Required', {
                body: checkIn.message,
                requireInteraction: true,
                icon: '/logo192.png'
            });
        }

        // Play sound
        const audio = new Audio('/alert.mp3');
        audio.play().catch(console.error);

        // Set up escalation timer
        setTimeout(() => {
            if (!checkIn.lastResponseTime || 
                checkIn.lastResponseTime.getTime() < Date.now() - checkIn.interval * 60000) {
                this.escalateCheckIn(checkIn);
            }
        }, checkIn.escalationDelay * 60000);

        // Schedule next check if not the last one
        if (checkIn.notificationsSent < checkIn.maxNotifications) {
            checkIn.notificationsSent++;
            this.scheduleNextCheck(checkIn);
        } else {
            this.failCheckIn(checkIn.id);
        }

        this.saveCheckIns();
    }

    private async escalateCheckIn(checkIn: CheckIn): Promise<void> {
        if (checkIn.status !== 'active') return;

        const escalationMessage = checkIn.customEscalationMessage || 
            `${checkIn.message}\n\nUser has not responded to scheduled check-in.`;

        // TODO: Integrate with your alert system here
        // This should send alerts to emergency contacts
        // You can use your existing alert system's API

        this.failCheckIn(checkIn.id);
    }

    public createCheckIn(params: Omit<CheckIn, 'id' | 'status' | 'notificationsSent'>): CheckIn {
        const checkIn: CheckIn = {
            ...params,
            id: crypto.randomUUID(),
            status: 'active',
            notificationsSent: 0,
            maxNotifications: params.maxNotifications || this.MAX_NOTIFICATIONS,
            escalationDelay: params.escalationDelay || this.DEFAULT_ESCALATION_DELAY
        };

        this.checkIns.set(checkIn.id, checkIn);
        this.scheduleNextCheck(checkIn);
        this.saveCheckIns();

        return checkIn;
    }

    public respondToCheckIn(checkInId: string, response: Omit<CheckInResponse, 'checkInId' | 'responseTime'>): void {
        const checkIn = this.checkIns.get(checkInId);
        if (!checkIn) {
            throw new Error('Check-in not found');
        }

        const now = new Date();
        checkIn.lastResponseTime = now;
        
        if (response.status !== 'safe') {
            this.escalateCheckIn(checkIn);
        } else {
            this.scheduleNextCheck(checkIn);
        }

        this.saveCheckIns();
    }

    public cancelCheckIn(checkInId: string): void {
        const checkIn = this.checkIns.get(checkInId);
        if (!checkIn) {
            throw new Error('Check-in not found');
        }

        checkIn.status = 'cancelled';
        if (this.timers.has(checkInId)) {
            clearTimeout(this.timers.get(checkInId));
            this.timers.delete(checkInId);
        }

        this.saveCheckIns();
    }

    private completeCheckIn(checkInId: string): void {
        const checkIn = this.checkIns.get(checkInId);
        if (!checkIn) {
            throw new Error('Check-in not found');
        }

        checkIn.status = 'completed';
        if (this.timers.has(checkInId)) {
            clearTimeout(this.timers.get(checkInId));
            this.timers.delete(checkInId);
        }

        this.saveCheckIns();
    }

    private failCheckIn(checkInId: string): void {
        const checkIn = this.checkIns.get(checkInId);
        if (!checkIn) {
            throw new Error('Check-in not found');
        }

        checkIn.status = 'failed';
        if (this.timers.has(checkInId)) {
            clearTimeout(this.timers.get(checkInId));
            this.timers.delete(checkInId);
        }

        this.saveCheckIns();
    }

    public getActiveCheckIns(): CheckIn[] {
        return Array.from(this.checkIns.values())
            .filter(checkIn => checkIn.status === 'active')
            .sort((a, b) => {
                const aNext = this.getNextCheckTime(a);
                const bNext = this.getNextCheckTime(b);
                return aNext.getTime() - bNext.getTime();
            });
    }

    public getCheckInHistory(): CheckIn[] {
        return Array.from(this.checkIns.values())
            .filter(checkIn => checkIn.status !== 'active')
            .sort((a, b) => {
                const aTime = a.lastResponseTime || a.scheduledTime;
                const bTime = b.lastResponseTime || b.scheduledTime;
                return bTime.getTime() - aTime.getTime();
            });
    }

    public getNextCheckTime(checkIn: CheckIn): Date {
        const baseTime = checkIn.lastResponseTime || checkIn.scheduledTime;
        return new Date(baseTime.getTime() + checkIn.interval * 60000);
    }

    public getTimeUntilNextCheck(checkInId: string): number {
        const checkIn = this.checkIns.get(checkInId);
        if (!checkIn || checkIn.status !== 'active') {
            return -1;
        }

        const nextCheck = this.getNextCheckTime(checkIn);
        return Math.max(0, nextCheck.getTime() - Date.now());
    }
}
