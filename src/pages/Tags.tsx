// copilot:lock
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MEASURE_UNITS, STORE_TAGS, PAYMENT_METHODS } from '@/types';

export default function Tags() {
  const navigate = useNavigate();

  // Dynamic categories state
  const initialCategories: {
    title: string;
    emoji: string;
    tags: string[];
    initialTags: string[];
    gradientClass: string;
    readOnly: boolean;
    variantType?: 'brand' | 'quantity' | 'size';
  }[] = [
    { title: 'Measure Units', emoji: '💼', tags: [...MEASURE_UNITS.map(String)], initialTags: [...MEASURE_UNITS.map(String)], gradientClass: 'bg-gradient-units', readOnly: false },
    { title: 'Store Tags', emoji: '📌', tags: [...STORE_TAGS.map(String)], initialTags: [...STORE_TAGS.map(String)], gradientClass: 'bg-gradient-store', readOnly: false },
    { title: 'Payment Method', emoji: '💳', tags: [...PAYMENT_METHODS.map(String)], initialTags: [...PAYMENT_METHODS.map(String)], gradientClass: 'bg-gradient-payment', readOnly: false },
  ];

  const [categories, setCategories] = useState(initialCategories);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(null);
  const activeCategory = activeCategoryIdx !== null ? categories[activeCategoryIdx] : null;

  // Add tag to category
  const handleAddTag = () => {
    if (!newTagName.trim() || activeCategoryIdx === null) return;
    setCategories(prev => prev.map((cat, idx) => idx === activeCategoryIdx ? { ...cat, tags: [...cat.tags, newTagName.trim()] } : cat));
    setNewTagName('');
    setIsAddTagOpen(false);
    toast.success('Tag added');
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, {
      title: newCategoryName.trim(),
      emoji: newCategoryEmoji || '🏷️',
      tags: [],
      initialTags: [],
      gradientClass: 'bg-gradient-primary',
      readOnly: false,
    }]);
    setNewCategoryName('');
    setNewCategoryEmoji('');
    setIsAddCategoryOpen(false);
    toast.success('Category added');
  };

  // Delete tag from category (only if not initial)
  const handleDeleteTag = (catIdx: number, tag: string) => {
    setCategories(prev => prev.map((cat, idx) => idx === catIdx ? { ...cat, tags: cat.tags.filter(t => !(cat.initialTags.includes(t) && t === tag)) } : cat));
    toast.success('Tag removed');
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 bg-accent hover:bg-accent/80 active:bg-accent/60 text-accent-foreground transition-colors"
              onClick={() => navigate(-1)}
              aria-label="Back"
              data-testid="button-back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </Button>
            <h1 className="text-3xl font-bold">Tags Management</h1>
          </div>
          <Button size="sm" onClick={() => setIsAddCategoryOpen(true)} className="bg-gradient-primary text-white font-semibold px-3 py-1">
            <Plus className="w-4 h-4 mr-1" /> New Category
          </Button>
        </div>

        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <TagCategoryCard
              key={cat.title}
              title={cat.title}
              emoji={cat.emoji}
              tags={cat.tags}
              initialTags={cat.initialTags}
              readOnly={cat.readOnly}
              gradientClass={cat.gradientClass}
              variantType={cat.variantType}
              onAdd={() => {
                setActiveCategoryIdx(idx);
                setIsAddTagOpen(true);
              }}
              onDelete={cat.readOnly ? undefined : (tag) => handleDeleteTag(idx, tag)}
            />
          ))}
        </div>
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag to {activeCategory?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag Name</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
                data-testid="input-tag-name"
              />
            </div>
            {activeCategory?.variantType && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  This is an item variant tag for <span className="font-semibold">{activeCategory.variantType}</span>. 
                  These tags can be applied to items to track variants like brands, sizes, or quantities.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag} data-testid="button-add-tag">
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              data-testid="input-category-name"
            />
            <Input
              value={newCategoryEmoji}
              onChange={(e) => setNewCategoryEmoji(e.target.value)}
              placeholder="Emoji (optional)"
              data-testid="input-category-emoji"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} data-testid="button-add-category">
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TagCategoryCard({ 
  title, 
  emoji, 
  tags, 
  readOnly,
  onAdd,
  onDelete,
  gradientClass,
  initialTags,
  variantType,
}: {
  title: string;
  emoji: string;
  tags: string[];
  initialTags: string[];
  readOnly: boolean;
  onAdd?: () => void;
  onDelete?: (tag: string) => void;
  gradientClass: string;
  variantType?: 'brand' | 'quantity' | 'size';
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card border-border">
        <CollapsibleTrigger className="w-full p-4" data-testid={`category-trigger-${title}`}> 
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <span className="text-xl">{emoji}</span>
              <Badge className={`${gradientClass} text-white font-semibold px-3 py-1`}>
                {title}
                {variantType && <span className="ml-1 text-xs opacity-80">({tags.length})</span>}
              </Badge>
            </div>
            {!readOnly && onAdd && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="bg-gradient-primary hover:opacity-90"
                data-testid={`button-add-tag-${title}`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {tags.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No tags added yet
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1"
                    data-testid={`tag-${title}-${tag}`}
                  >
                    <Badge className={`${gradientClass} text-white font-semibold px-3 py-1`}>{tag}</Badge>
                    {!readOnly && onDelete && !initialTags.includes(tag) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-transparent"
                        onClick={() => onDelete(tag)}
                        data-testid={`button-delete-${tag}`}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
