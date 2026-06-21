import { useGameStore } from '@/store/useGameStore';
import { Undo2, Redo2 } from 'lucide-react';

export default function UndoRedoBar() {
  const { undo, redo, canUndo, canRedo, historyIndex, history } = useGameStore();

  const undoEnabled = canUndo();
  const redoEnabled = canRedo();

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-3 py-2">
      <button
        onClick={undo}
        disabled={!undoEnabled}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${undoEnabled
            ? 'text-amber-700 hover:bg-amber-50 active:bg-amber-100'
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title={history[historyIndex]?.description || '撤销上一步'}
      >
        <Undo2 className="w-4 h-4" />
        <span>撤销</span>
      </button>

      <div className="w-px h-6 bg-gray-200" />

      <button
        onClick={redo}
        disabled={!redoEnabled}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${redoEnabled
            ? 'text-amber-700 hover:bg-amber-50 active:bg-amber-100'
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title={history[historyIndex + 1]?.description || '重做下一步'}
      >
        <Redo2 className="w-4 h-4" />
        <span>重做</span>
      </button>

      <div className="ml-2 text-xs text-gray-400">
        {historyIndex + 1} / {history.length}
      </div>
    </div>
  );
}
