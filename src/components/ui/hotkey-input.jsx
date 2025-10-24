import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, X } from 'lucide-react';

/**
 * 快捷键输入组件
 * 允许用户通过键盘输入自定义快捷键组合
 */
const HotkeyInput = ({ 
  value = '', 
  onChange, 
  placeholder = '按下快捷键组合',
  disabled = false,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);

  // 将快捷键字符串转换为显示格式
  const formatHotkeyForDisplay = (hotkey) => {
    if (!hotkey) return '';
    
    return hotkey
      .replace('CommandOrControl', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Space', '空格')
      .replace(/\+/g, ' + ');
  };

  // 将按键组合转换为标准格式
  const normalizeHotkey = (keys) => {
    const modifiers = ['Control', 'Alt', 'Shift', 'Meta', 'CommandOrControl'];
    const specialKeys = {
      ' ': 'Space',
      'Space': 'Space'
    };
    
    // 处理Mac的Command键
    if (keys.includes('Meta')) {
      keys = keys.filter(key => key !== 'Meta');
      keys.push('CommandOrControl');
    }
    
    // 处理Windows/Linux的Control键
    if (keys.includes('Control') && !keys.includes('CommandOrControl')) {
      keys = keys.filter(key => key !== 'Control');
      keys.push('CommandOrControl');
    }
    
    // 排序确保一致性
    const sortedKeys = [];
    modifiers.forEach(mod => {
      if (keys.includes(mod)) {
        sortedKeys.push(mod);
      }
    });
    
    // 添加非修饰键
    keys.forEach(key => {
      if (!modifiers.includes(key)) {
        sortedKeys.push(specialKeys[key] || key);
      }
    });
    
    return sortedKeys.join('+');
  };

  // 开始录制快捷键
  const startRecording = () => {
    if (disabled) return;
    
    setIsRecording(true);
    setDisplayValue('按下快捷键...');
  };

  // 停止录制
  const stopRecording = () => {
    setIsRecording(false);
  };

  // 清除快捷键
  const clearHotkey = () => {
    if (disabled) return;
    
    onChange('');
    setDisplayValue('');
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (!isRecording || disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 处理Escape键取消录制
    if (e.key === 'Escape') {
      stopRecording();
      setDisplayValue(formatHotkeyForDisplay(value));
      return;
    }
    
    const keys = [];
    
    // 添加修饰键
    if (e.ctrlKey) keys.push('Control');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.metaKey) keys.push('Meta');
    
    // 添加主键（排除单独的修饰键）
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      keys.push(e.key);
    }
    
    // 如果只有修饰键，不处理
    if (keys.length === 0 || (keys.length === 1 && ['Control', 'Alt', 'Shift', 'Meta'].includes(keys[0]))) {
      return;
    }
    
    const normalizedHotkey = normalizeHotkey(keys);
    onChange(normalizedHotkey);
    setDisplayValue(formatHotkeyForDisplay(normalizedHotkey));
    stopRecording();
  };

  // 处理失焦事件
  const handleBlur = () => {
    if (isRecording) {
      stopRecording();
      // 恢复原始值
      setDisplayValue(formatHotkeyForDisplay(value));
    }
  };

  // 初始化显示值
  useEffect(() => {
    setDisplayValue(formatHotkeyForDisplay(value));
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <div
          ref={inputRef}
          className={`
            flex-1 px-3 py-2 text-sm border rounded-lg cursor-pointer
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            border-gray-300 dark:border-gray-600
            ${isRecording 
              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
              : 'hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={isRecording ? undefined : startRecording}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          tabIndex={disabled ? -1 : 0}
        >
          {isRecording ? (
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-blue-500">{displayValue}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className={displayValue ? 'font-mono' : 'text-gray-500 dark:text-gray-400'}>
                {displayValue || placeholder}
              </span>
              {displayValue && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHotkey();
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isRecording && (
        <div className="absolute z-10 w-full mt-1 p-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
          按下快捷键组合，或按Esc取消
        </div>
      )}
    </div>
  );
};

export default HotkeyInput;