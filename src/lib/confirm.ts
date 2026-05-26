/** 删除等危险操作前的确认（单人相册，轻量实现） */
export function confirmAction(message: string): boolean {
  return window.confirm(message);
}
