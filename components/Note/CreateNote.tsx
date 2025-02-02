import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WandSparkles } from 'lucide-react';
import React from 'react';
import { Label } from '@/components/ui/label';

interface CreateNoteDialogProps {
    onCreate: (data: { title: string; content: string; category?: string }) => void;
    open: boolean;
    onClose: () => void;
}

export default function CreateNoteDialog({ onCreate, open, onClose }: CreateNoteDialogProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isGeneratingCategory, setIsGeneratingCategory] = useState(false);

    const generateCategorysuggestion = async () => {
        if (!content || !title || isGeneratingCategory) return;
        
        try {
            setIsGeneratingCategory(true);
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!response.ok) throw new Error('Failed to generate suggestion');

            const data = await response.json();
            if (data.category) {
                setCategory(data.category);
            }
        } catch (error) {
            console.error('Error generating category:', error);
        } finally {
            setIsGeneratingCategory(false);
        }
    };

    // Debounce the content changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content.length > 10) {
                generateCategorysuggestion();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ title, content, category });
        setTitle('');
        setContent('');
        setCategory('');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className="h-32"
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                                <WandSparkles 
                                    className={`h-5 w-5 ${isGeneratingCategory ? 'text-blue-500 animate-spin' : 'text-gray-500'}`}
                                    onClick={generateCategorysuggestion}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Note</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
