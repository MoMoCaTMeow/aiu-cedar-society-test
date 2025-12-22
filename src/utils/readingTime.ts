/**
 * テキストの読了時間を計算（日本語対応）
 * 日本語: 1分あたり約400文字
 * 英語: 1分あたり約200単語
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;

  // HTMLタグを除去
  const text = content.replace(/<[^>]*>/g, '');

  // 日本語文字数（ひらがな、カタカナ、漢字、全角記号）
  const japaneseChars = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/g)?.length || 0;

  // 英語単語数
  const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;

  // 読了時間を計算（日本語400文字/分、英語200単語/分）
  const japaneseTime = japaneseChars / 400;
  const englishTime = englishWords / 200;

  // 最小1分、最大は切り上げ
  const totalMinutes = Math.max(1, Math.ceil(japaneseTime + englishTime));

  return totalMinutes;
}

