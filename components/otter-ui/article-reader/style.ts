
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import tw from 'twrnc';

export const container = tva({
  base: "flex-1 bg-background-0 flex flex-col",
});

export const header = tva({
  base: "px-4 py-1 bg-background-50 flex justify-between items-center flex-row",
});

export const headerTitle = tva({
  base: "text-sm text-typography-500 flex-1 mr-2 line-clamp-1",
});

export const headerTime = tva({
  base: "text-sm text-typography-500 shrink-0",
});

export const info = tva({
  base: "px-4 py-4 border-b border-outline-50 bg-background-50 rounded-md mb-2",
});

export const infoTitle = tva({
  base: "text-xl font-bold text-typography-900",
});

export const infoSubtitle = tva({
  base: "text-sm text-typography-500 mt-2",
});

export const contentContainer = tva({
  base: "flex-1 bg-background-0",
});

export const content = tva({
  base: "flex-1 px-4 py-4",
});

export const contentText = tva({
  base: "text-base text-typography-800 leading-relaxed whitespace-pre-wrap",
});

export const footer = tva({
  base: "w-full h-24",
});

export const tagsStyles = {
  body: tw`text-base leading-6 text-gray-800`,

  h1: tw`text-3xl font-bold text-gray-900 mb-4 mt-2`,
  h2: tw`text-2xl font-semibold text-gray-800 mb-3 mt-4`,
  h3: tw`text-xl font-semibold text-gray-700 mb-2 mt-3`,

  p: tw`text-base text-gray-700 mb-3 leading-relaxed`,
  strong: tw`font-bold text-gray-900`,
  em: tw`italic`,
  u: tw`underline`,

  a: tw`text-blue-600 font-medium underline`,

  ul: tw`pl-5 mb-4`,
  ol: tw`pl-5 mb-4`,
  li: tw`mb-2 text-gray-700 leading-relaxed`,

  blockquote: tw`border-l-4 border-blue-500 pl-4 py-2 italic text-gray-600 bg-gray-50 my-4`,

  code: tw`bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono`,
  pre: tw`bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-hidden`,

  hr: tw`my-6 border-gray-300`,

  table: tw`mb-4 w-full`,
  thead: tw`bg-gray-100`,
  th: tw`font-bold text-gray-900 p-2 text-left border border-gray-300`,
  td: tw`p-2 text-gray-700 border border-gray-300`,

  img: tw`rounded-lg my-4`,
};
