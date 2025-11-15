import React, { useState } from 'react';
import { Poll, PollOption, PollDuration, POLL_DURATIONS, POLL_OPTION_COLORS, POLL_TEMPLATES, PollTemplate } from '@/types/polls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Sparkles } from 'lucide-react';

interface PollCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (poll: Poll) => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [duration, setDuration] = useState<PollDuration>('1m');

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setDuration('1m');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const applyTemplate = (template: PollTemplate) => {
    setQuestion(template.question);
    setOptions(template.options);
  };

  const createPoll = () => {
    // Validate
    if (!question.trim()) return;

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) return;

    const now = Date.now();
    const durationMs = POLL_DURATIONS[duration] * 1000;

    const pollOptions: PollOption[] = validOptions.map((text, index) => ({
      id: `option-${index}`,
      text: text.trim(),
      votes: 0,
      votedBy: [],
      color: POLL_OPTION_COLORS[index % POLL_OPTION_COLORS.length],
    }));

    const poll: Poll = {
      id: `poll-${now}`,
      question: question.trim(),
      options: pollOptions,
      createdBy: 'MODERATOR',
      createdAt: now,
      duration: POLL_DURATIONS[duration],
      endsAt: now + durationMs,
      status: 'active',
      totalVotes: 0,
    };

    onCreate(poll);
    handleClose();
  };

  const canCreate = question.trim().length > 0 && options.filter(opt => opt.trim().length > 0).length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Create a Poll</DialogTitle>
          <DialogDescription className="text-gray-400">
            Ask your chat a question and let them vote!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Templates */}
          <div>
            <Label className="text-sm text-gray-400 mb-2 block">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Quick Templates
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(POLL_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-xs"
                >
                  {template.question}
                </Button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div>
            <Label htmlFor="question" className="text-white">
              Question *
            </Label>
            <Input
              id="question"
              placeholder="What do you want to ask chat?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-2"
            />
            <span className="text-xs text-gray-500 mt-1">
              {question.length}/200 characters
            </span>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Options * (2-6)</Label>
              {options.length < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <div
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: POLL_OPTION_COLORS[index % POLL_OPTION_COLORS.length] }}
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      maxLength={100}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-8"
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-white">
              Duration
            </Label>
            <Select value={duration} onValueChange={(value) => setDuration(value as PollDuration)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.entries(POLL_DURATIONS).map(([key, seconds]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={createPoll}
            disabled={!canCreate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Create Poll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PollCreator;
