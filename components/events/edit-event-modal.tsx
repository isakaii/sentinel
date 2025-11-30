"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Event, EventType } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSave: (eventId: string, updates: Partial<Event>) => Promise<void>;
}

const eventTypeOptions = [
  { value: "assignment", label: "Assignment" },
  { value: "exam", label: "Exam" },
  { value: "quiz", label: "Quiz" },
  { value: "reading", label: "Reading" },
  { value: "important_date", label: "Important Date" },
];

export function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || "");
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time || "");
  const [type, setType] = useState<EventType>(event.type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updates: Partial<Event> = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time: time || undefined,
        type,
      };

      await onSave(event.id, updates);
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      // Reset to original values
      setTitle(event.title);
      setDescription(event.description || "");
      setDate(event.date);
      setTime(event.time || "");
      setType(event.type);
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Event" className="max-w-lg">
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          disabled={saving}
        />

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event description (optional)"
            disabled={saving}
            rows={3}
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <Select
            options={eventTypeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            disabled={saving}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={saving}
          />
          <Input
            label="Time (optional)"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
