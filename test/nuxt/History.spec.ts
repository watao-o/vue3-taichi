import { describe, it, expect, vi, beforeAll } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";

import type { JSONContent } from "@tiptap/vue-3";
import { useEditorStore } from "@/stores/editorStore";
import { getTodayJST } from "@/utils/DateUtils";

vi.mock("@tiptap/html", () => ({
  generateHTML: (doc: any) =>
    `<p>${doc?.content?.[0]?.content?.[0]?.text ?? ""}</p>`,
}));

let HistoryComponent: typeof import("@/components/History.vue")["default"];

beforeAll(async () => {
  HistoryComponent = (await import("@/components/History.vue")).default;
});

const createDoc = (text: string): JSONContent => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text,
        },
      ],
    },
  ],
});

const mountHistory = () =>
  mountSuspended(HistoryComponent, {
    global: {
      stubs: {
        VListItemTextarea: {
          template: '<div class="v-list-item-textarea"><slot /></div>',
        },
        "v-list-item-textarea": {
          template: '<div class="v-list-item-textarea"><slot /></div>',
        },
      },
    },
  });

type EditorStore = ReturnType<typeof useEditorStore>;

const addHistoryEntry = async (store: EditorStore, doc: JSONContent) => {
  store.setEditorData(doc);
  await nextTick();
  await nextTick();
};

const findHistoryButton = async (
  wrapper: Awaited<ReturnType<typeof mountHistory>>,
  label: string
) => {
  await wrapper.vm.$nextTick();
  await nextTick();
  return wrapper
    .findAll("button")
    .find((buttonWrapper) => buttonWrapper.text() === label);
};

describe("History.vue (Nuxt integration)", () => {
  it("renders diagnosis history entries from the editor store", async () => {
    const wrapper = await mountHistory();
    const editorStore = useEditorStore();
    editorStore.clearEditorData();
    const today = getTodayJST();

    await addHistoryEntry(editorStore, createDoc("First history entry"));
    await addHistoryEntry(editorStore, createDoc("Second history entry"));
    await wrapper.vm.$nextTick();
    await nextTick();

    const buttons = wrapper.findAll("button");
    expect(buttons.map((button) => button.text())).toEqual([
      `${today}_1`,
      `${today}_2`,
    ]);
    expect(wrapper.html()).toContain("<p>First history entry</p>");
    expect(wrapper.html()).toContain("<p>Second history entry</p>");
  });

  it("emits clickHistory with the selected editor content", async () => {
    const wrapper = await mountHistory();
    const editorStore = useEditorStore();
    editorStore.clearEditorData();
    const today = getTodayJST();
    const firstEntry = createDoc("Selectable history entry");

    await addHistoryEntry(editorStore, firstEntry);

    const button = await findHistoryButton(wrapper, `${today}_1`);
    expect(button).toBeTruthy();

    await button!.trigger("click");

    const emitted = wrapper.emitted("clickHistory");
    expect(emitted).toBeTruthy();
    const [payload] = emitted?.[0] ?? [];
    expect(payload).toEqual(firstEntry);
  });
});
