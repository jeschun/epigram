import { useEffect, useState } from "react";
import { EpigramBase, Page } from "@/src/types/api";
import { listEpigrams } from "@/lib/epigram";

export default function EpigramListPage() {
  const [data, setData] = useState<Page<EpigramBase> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await listEpigrams({ limit: 10 });
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-8">불러오는 중…</div>;
  if (!data || data.list.length === 0)
    return <div className="p-8">첫 에피그램을 작성해보세요!</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      {data.list.map((e) => (
        <article key={e.id} className="rounded border p-4">
          <div className="text-lg">{e.content}</div>
          <div className="text-sm text-gray-500 mt-1">— {e.author}</div>
        </article>
      ))}
    </main>
  );
}
