'use client';

import React, { useState } from 'react';
import { Room, Booking } from '@/types';
import {
  DoorOpen,
  Plus,
  Search,
  Users,
  Layers,
  CalendarCheck,
  Edit2,
  Trash2,
  X,
  Check,
  Tv,
  Wind,
  Square,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface RoomsSectionProps {
  rooms: Room[];
  onAddRoom: (item: Omit<Room, 'id' | 'bookings'>) => Promise<void>;
  onUpdateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onBookRoom: (roomNumber: string, booking: Omit<Booking, 'booking_id'>) => Promise<{ success: boolean; message: string }>;
  onCancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
}

export default function RoomsSection({
  rooms,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onBookRoom,
  onCancelBooking,
}: RoomsSectionProps) {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [bookingRoomTarget, setBookingRoomTarget] = useState<Room | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Room Form
  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    type: 'classroom',
    capacity: 40,
    equipment: ['projector', 'whiteboard'],
    floor: 7,
    status: 'available',
  });

  // Booking Form
  const [bookingFormData, setBookingFormData] = useState({
    booked_by: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    purpose: '',
  });

  const openAddRoomModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      room_number: '',
      type: 'classroom',
      capacity: 40,
      equipment: ['projector', 'whiteboard'],
      floor: 7,
      status: 'available',
    });
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      room_number: room.room_number,
      type: room.type,
      capacity: room.capacity,
      equipment: room.equipment || [],
      floor: room.floor,
      status: room.status,
    });
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      await onUpdateRoom(editingRoom.id, roomFormData);
    } else {
      await onAddRoom(roomFormData);
    }
    setIsRoomModalOpen(false);
  };

  const openBookingModal = (room: Room) => {
    setBookingRoomTarget(room);
    setBookingError('');
    setBookingSuccess('');
    setBookingFormData({
      booked_by: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '14:00',
      end_time: '16:00',
      purpose: '',
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoomTarget) return;
    setBookingError('');
    setBookingSuccess('');

    const res = await onBookRoom(bookingRoomTarget.room_number, bookingFormData);
    if (!res.success) {
      setBookingError(res.message);
    } else {
      setBookingSuccess(res.message);
      setTimeout(() => {
        setBookingRoomTarget(null);
      }, 1500);
    }
  };

  const filtered = rooms.filter((r) => {
    const matchesType = selectedType === 'All' || r.type.toLowerCase() === selectedType.toLowerCase();
    const matchesEquipment =
      equipmentFilter === 'All' ||
      (r.equipment && r.equipment.some((eq) => eq.toLowerCase() === equipmentFilter.toLowerCase()));
    const matchesSearch =
      r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesEquipment && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <DoorOpen className="w-5 h-5 text-emerald-500" />
            <span>Room & Laboratory Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classrooms (7A), Computer Labs (7B), and Seminar Halls (7C) with live bookings.
          </p>
        </div>
        <button
          onClick={openAddRoomModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center space-x-1">
            {['All', 'classroom', 'lab', 'seminar'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedType === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Equipment Filter */}
          <div className="flex items-center space-x-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            <span className="text-[11px] text-slate-400">Equip:</span>
            {['All', 'projector', 'AC', 'whiteboard'].map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipmentFilter(eq)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  equipmentFilter === eq
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-56">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search room (e.g. 7A02)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No rooms found matching your filters.
          </div>
        ) : (
          filtered.map((room) => {
            const hasBookings = room.bookings && room.bookings.length > 0;
            return (
              <div
                key={room.id}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        {room.room_number}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {room.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditRoomModal(room)}
                        title="Edit Room"
                        className="p-1 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRoom(room.id)}
                        title="Delete Room"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Room Specs */}
                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 my-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{room.capacity} seats</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-sky-500" />
                      <span>Floor {room.floor}</span>
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          room.status === 'available'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>

                  {/* Equipment Badges */}
                  <div className="flex flex-wrap gap-1 my-2.5">
                    {room.equipment?.map((eq, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Existing Bookings */}
                  {hasBookings && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Active Bookings ({room.bookings.length}):</span>
                      </span>
                      <div className="space-y-1">
                        {room.bookings.map((b) => (
                          <div
                            key={b.booking_id}
                            className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                          >
                            <div className="truncate pr-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {b.date} ({b.start_time} - {b.end_time}):
                              </span>{' '}
                              <span className="text-slate-500">{b.booked_by}</span>
                            </div>
                            <button
                              onClick={() => onCancelBooking(b.booking_id)}
                              title="Cancel Booking"
                              className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openBookingModal(room)}
                    className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Book This Room</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Room Modal */}
      {bookingRoomTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Book Room {bookingRoomTarget.room_number}
                </h3>
                <p className="text-xs text-slate-500">
                  Capacity: {bookingRoomTarget.capacity} | Floor: {bookingRoomTarget.floor}
                </p>
              </div>
              <button
                onClick={() => setBookingRoomTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Booked By (Person or Club) *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AI Club or Student Name"
                  value={bookingFormData.booked_by}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, booked_by: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={bookingFormData.date}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start (24h) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="14:00"
                    value={bookingFormData.start_time}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, start_time: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End (24h) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="16:00"
                    value={bookingFormData.end_time}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, end_time: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Study Group, Workshop, Practice"
                  value={bookingFormData.purpose}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBookingRoomTarget(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add New Campus Room'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Code *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 7A05"
                    value={roomFormData.room_number}
                    onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="classroom">classroom</option>
                    <option value="lab">lab</option>
                    <option value="seminar">seminar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity *
                  </label>
                  <input
                    required
                    type="number"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor *
                  </label>
                  <input
                    required
                    type="number"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={roomFormData.status}
                    onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="available">available</option>
                    <option value="unavailable">unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Equipment (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="projector, AC, whiteboard"
                  value={roomFormData.equipment.join(', ')}
                  onChange={(e) =>
                    setRoomFormData({
                      ...roomFormData,
                      equipment: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
