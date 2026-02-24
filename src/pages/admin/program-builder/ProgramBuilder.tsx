import { useState } from "react";
import {
    Search,
    Plus,
    GripVertical,
    Trash2,
    Play,
    Clock,
    Info,
    Filter,
    Save,
    CheckCircle2
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Exercise {
    id: string;
    name: string;
    category: string;
    duration: string;
    thumbnail: string;
}

const mockExercises: Exercise[] = [
    { id: "e1", name: "Single Leg Squat", category: "Lower Body", duration: "10-12 reps", thumbnail: "SLS" },
    { id: "e2", name: "Glute Bridge", category: "Core", duration: "15 reps", thumbnail: "GB" },
    { id: "e3", name: "Deadbug", category: "Core", duration: "45 sec", thumbnail: "DB" },
    { id: "e4", name: "Bird Dog", category: "Core", duration: "10 each side", thumbnail: "BD" },
    { id: "e5", name: "Goblet Squat", category: "Lower Body", duration: "12 reps", thumbnail: "GS" },
    { id: "e6", name: "Plank with Shoulder Tap", category: "Core", duration: "30 sec", thumbnail: "PST" },
];

export const ProgramBuilder = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    const filteredExercises = mockExercises.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(selectedExercises);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedExercises(items);
    };

    const addToProgram = (exercise: Exercise) => {
        if (selectedExercises.find(item => item.id === exercise.id)) return;
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const removeFromProgram = (id: string) => {
        setSelectedExercises(selectedExercises.filter(item => item.id !== id));
    };

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Program Builder</h2>
                    <p className="text-sm text-slate-500">Create custom exercise protocols for your clients.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${isSaved
                                ? "bg-green-500 text-white"
                                : "bg-[#0F172A] text-white hover:bg-slate-800"
                            }`}
                    >
                        {isSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {isSaved ? "Program Saved" : "Save Program"}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left: Exercise Library */}
                <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-[#0F172A] mb-4">Exercise Library</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-100">
                        {filteredExercises.map(ex => (
                            <div
                                key={ex.id}
                                className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-all cursor-pointer group"
                                onClick={() => addToProgram(ex)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-400">
                                        {ex.thumbnail}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#0F172A] truncate">{ex.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">{ex.category}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Program Workspace */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-[#0F172A]">Workspace</h3>
                            <div className="h-5 w-px bg-slate-200" />
                            <span className="text-xs font-medium text-slate-500">{selectedExercises.length} Exercises Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-slate-200 text-slate-500">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
                        {selectedExercises.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-slate-200 rounded-3xl p-12">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="h-8 w-8 text-slate-300" />
                                </div>
                                <h4 className="font-bold text-[#0F172A]">Your Program is Empty</h4>
                                <p className="text-sm text-slate-500 max-w-xs mt-2">Add exercises from the library on the left to start building your protocol.</p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="program-builder">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                            {selectedExercises.map((ex, index) => (
                                                <Draggable key={ex.id} draggableId={ex.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`flex items-center gap-4 p-4 bg-white border rounded-2xl transition-all ${snapshot.isDragging ? "border-blue-500 shadow-xl ring-2 ring-blue-500/10 scale-[1.02]" : "border-slate-200 shadow-sm"
                                                                }`}
                                                        >
                                                            <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600">
                                                                <GripVertical className="h-5 w-5" />
                                                            </div>
                                                            <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                                                {index + 1}
                                                            </span>
                                                            <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 shrink-0">
                                                                {ex.thumbnail}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-[#0F172A]">{ex.name}</p>
                                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {ex.duration}</span>
                                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                                    <span>{ex.category}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-[#0F172A] transition-colors">
                                                                    <Info className="h-4 w-4" />
                                                                </button>
                                                                <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                                    <Play className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => removeFromProgram(ex.id)}
                                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
