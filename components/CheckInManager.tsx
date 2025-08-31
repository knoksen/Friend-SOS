import React, { useState, useEffect } from 'react';
import { CheckInService } from '../services/checkInService';

interface CheckInFormData {
    message: string;
    interval: number;
    duration?: number;
    contacts: string[];
    escalationDelay: number;
    maxNotifications: number;
    customEscalationMessage?: string;
}

const CheckInManager: React.FC = () => {
    const [activeCheckIns, setActiveCheckIns] = useState<any[]>([]);
    const [checkInHistory, setCheckInHistory] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<CheckInFormData>({
        message: '',
        interval: 30,
        duration: 120,
        contacts: [],
        escalationDelay: 5,
        maxNotifications: 3
    });

    const checkInService = CheckInService.getInstance();

    useEffect(() => {
        const updateCheckIns = () => {
            setActiveCheckIns(checkInService.getActiveCheckIns());
            setCheckInHistory(checkInService.getCheckInHistory());
        };

        updateCheckIns();
        const interval = setInterval(updateCheckIns, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const handleCreateCheckIn = (e: React.FormEvent) => {
        e.preventDefault();
        
        const now = new Date();
        const checkIn = checkInService.createCheckIn({
            userId: 'current-user', // Replace with actual user ID
            scheduledTime: now,
            endTime: formData.duration ? new Date(now.getTime() + formData.duration * 60000) : undefined,
            message: formData.message,
            interval: formData.interval,
            contacts: formData.contacts,
            responseRequired: true,
            escalationDelay: formData.escalationDelay,
            maxNotifications: formData.maxNotifications,
            customEscalationMessage: formData.customEscalationMessage
        });

        setActiveCheckIns(checkInService.getActiveCheckIns());
        setShowForm(false);
        setFormData({
            message: '',
            interval: 30,
            duration: 120,
            contacts: [],
            escalationDelay: 5,
            maxNotifications: 3
        });
    };

    const handleCancelCheckIn = (checkInId: string) => {
        checkInService.cancelCheckIn(checkInId);
        setActiveCheckIns(checkInService.getActiveCheckIns());
        setCheckInHistory(checkInService.getCheckInHistory());
    };

    const handleRespond = (checkInId: string, status: 'safe' | 'help' | 'emergency') => {
        checkInService.respondToCheckIn(checkInId, { status });
        setActiveCheckIns(checkInService.getActiveCheckIns());
    };

    const formatTimeUntilNext = (checkInId: string): string => {
        const ms = checkInService.getTimeUntilNextCheck(checkInId);
        if (ms < 0) return 'N/A';
        
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-200">Check-ins</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    Schedule Check-in
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">Schedule New Check-in</h3>
                        <form onSubmit={handleCreateCheckIn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Check-in Message
                                </label>
                                <input
                                    type="text"
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        message: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Time to check in! Are you safe?"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Interval (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.interval}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            interval: parseInt(e.target.value)
                                        }))}
                                        min="1"
                                        className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        required
                                        title="Check-in interval in minutes"
                                        placeholder="Enter interval in minutes"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            duration: parseInt(e.target.value)
                                        }))}
                                        min="1"
                                        className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        title="Total duration in minutes"
                                        placeholder="Enter total duration"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Escalation Delay (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.escalationDelay}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            escalationDelay: parseInt(e.target.value)
                                        }))}
                                        min="1"
                                        className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        required
                                        title="Time to wait before escalating"
                                        placeholder="Enter escalation delay"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Max Notifications
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxNotifications}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            maxNotifications: parseInt(e.target.value)
                                        }))}
                                        min="1"
                                        className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        required
                                        title="Maximum number of notifications"
                                        placeholder="Enter max notifications"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Escalation Message (Optional)
                                </label>
                                <textarea
                                    value={formData.customEscalationMessage}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        customEscalationMessage: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Custom message to send to contacts if you don't respond"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeCheckIns.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400">Active Check-ins</h3>
                    <div className="space-y-3">
                        {activeCheckIns.map((checkIn) => (
                            <div
                                key={checkIn.id}
                                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-200">{checkIn.message}</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Next check: {formatTimeUntilNext(checkIn.id)}
                                            {checkIn.endTime && ` • Ends: ${checkIn.endTime.toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleRespond(checkIn.id, 'safe')}
                                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                        >
                                            I'm Safe
                                        </button>
                                        <button
                                            onClick={() => handleRespond(checkIn.id, 'help')}
                                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                                        >
                                            Need Help
                                        </button>
                                        <button
                                            onClick={() => handleRespond(checkIn.id, 'emergency')}
                                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                        >
                                            Emergency
                                        </button>
                                        <button
                                            onClick={() => handleCancelCheckIn(checkIn.id)}
                                            className="p-1 text-gray-400 hover:text-gray-300"
                                            title="Cancel check-in"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {checkInHistory.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400">History</h3>
                    <div className="space-y-3">
                        {checkInHistory.map((checkIn) => (
                            <div
                                key={checkIn.id}
                                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                                <div>
                                    <p className="text-gray-200">{checkIn.message}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Status: {checkIn.status}
                                        {checkIn.lastResponseTime && 
                                            ` • Last response: ${checkIn.lastResponseTime.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckInManager;
