import type { ValidationResult } from '@/types';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale,
  Eye,
  Package,
  Clock,
} from 'lucide-react';

interface ValidationPanelProps {
  result: ValidationResult | null;
  isSubmitted: boolean;
  remainingTime?: number | null;
  isFailed?: boolean;
}

export default function ValidationPanel({
  result,
  isSubmitted,
  remainingTime,
  isFailed,
}: ValidationPanelProps) {
  if (isFailed && remainingTime === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg p-6 border-2 border-red-300">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-xl font-bold text-red-700 mb-2">时间到！</h3>
          <p className="text-red-600 mb-4">挑战失败，请重新开始</p>
        </div>
      </div>
    );
  }

  if (!isSubmitted || !result) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">实时校验</h3>
        {result && result.violations.length > 0 ? (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-amber-700">
                  发现 {result.violations.length} 项违规
                </span>
              </div>
              <ul className="space-y-1 text-sm text-amber-600">
                {result.violations.slice(0, 3).map((v, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{v.message}</span>
                  </li>
                ))}
                {result.violations.length > 3 && (
                  <li className="text-amber-500 text-xs">
                    还有 {result.violations.length - 3} 项违规...
                  </li>
                )}
              </ul>
            </div>
            <p className="text-xs text-gray-500 text-center">
              💡 调整商品位置以消除所有违规项
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <CheckCircle className="w-12 h-12 mb-3 text-green-400" />
            <p className="text-sm text-green-600 font-medium">当前无违规项</p>
            <p className="text-xs text-gray-400 mt-1">提交后即可完成挑战</p>
          </div>
        )}
      </div>
    );
  }

  const { passed, violations, weightCheck, positionCheck, stockCheck } = result;

  const weightViolations = violations.filter((v) => v.type === 'weight');
  const positionViolations = violations.filter((v) => v.type === 'position');
  const stockViolations = violations.filter((v) => v.type === 'stock');

  const CheckItem = ({
    label,
    icon: Icon,
    passed,
    violations,
    color,
  }: {
    label: string;
    icon: typeof CheckCircle;
    passed: boolean;
    violations: { message: string; details?: string }[];
    color: string;
  }) => (
    <div
      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        {passed ? (
          <CheckCircle className={`w-6 h-6 text-green-500`} />
        ) : (
          <XCircle className={`w-6 h-6 text-red-500`} />
        )}
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className={`font-semibold ${passed ? 'text-green-700' : 'text-red-700'}`}>
            {label}
          </span>
        </div>
        <span
          className={`ml-auto text-sm font-medium ${
            passed ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {passed ? '通过' : `${violations.length} 项违规`}
        </span>
      </div>

      {!passed && violations.length > 0 && (
        <ul className="mt-3 space-y-2">
          {violations.map((v, i) => (
            <li key={i} className="text-sm text-red-600 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <div>
                <span className="font-medium">{v.message}</span>
                {v.details && (
                  <p className="text-xs text-red-500 mt-0.5">{v.details}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">校验结果</h3>
        <div
          className={`
          px-4 py-1.5 rounded-full text-sm font-bold
          ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          animate-pulse
        `}
        >
          {passed ? '🎉 闯关成功！' : '❌ 闯关失败'}
        </div>
      </div>

      {!passed && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            共发现 <span className="font-bold">{violations.length}</span>{' '}
            项违规，请调整后重新提交
          </p>
        </div>
      )}

      <div className="space-y-4">
        <CheckItem
          label="承重限制校验"
          icon={Scale}
          passed={weightCheck.passed}
          violations={weightViolations}
          color="text-amber-600"
        />

        <CheckItem
          label="位置规则校验"
          icon={Eye}
          passed={positionCheck.passed}
          violations={positionViolations}
          color="text-blue-600"
        />

        <CheckItem
          label="库存数量校验"
          icon={Package}
          passed={stockCheck.passed}
          violations={stockViolations}
          color="text-purple-600"
        />
      </div>

      {passed && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center">
          <p className="text-green-700 font-medium">
            🎊 恭喜！你已成功通过本关挑战
          </p>
          <p className="text-sm text-green-600 mt-1">已解锁下一关和道具奖励</p>
        </div>
      )}
    </div>
  );
}
