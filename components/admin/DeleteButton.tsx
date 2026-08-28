"use client";

// 删除按钮：点击后弹出「是否删除？」确认框，确认才提交所在表单
export default function DeleteButton({
  text = "删除",
  className = "rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`cursor-pointer ${className}`}
      onClick={(e) => {
        const form = e.currentTarget.closest("form");
        if (form && window.confirm("是否删除？")) {
          form.requestSubmit();
        }
      }}
    >
      {text}
    </button>
  );
}
