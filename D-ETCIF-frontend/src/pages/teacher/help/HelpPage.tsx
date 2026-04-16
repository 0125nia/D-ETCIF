// Package help
// D-ETCIF-frontend/src/pages/teacher/help/HelpPage.tsx
import { useState, useEffect } from "react";
import { AsideMainLayout } from "@/layouts";
import { PageContainer } from "@/components/common";
import { HelpAside, HelpMain } from "@/components/teacher";
import { getTeacherHelpList } from "@/services";
import type { HelpDetail } from "@/types";

export default function HelpPage() {
  const [helpList, setHelpList] = useState<HelpDetail[]>([]);
  const [selectedHelp, setSelectedHelp] = useState<HelpDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getTeacherHelpList();
      const { details } = res;

      setHelpList(details || []);

      if (details?.length > 0 && !selectedHelp) {
        setSelectedHelp(details[0]);
      }
    } catch (error) {
      console.error("加载求助列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <PageContainer title="求助管理中心">
      <AsideMainLayout
        aside={
          <HelpAside
            list={helpList}
            activeId={selectedHelp?.id}
            onSelect={setSelectedHelp}
            loading={loading}
          />
        }
        main={<HelpMain data={selectedHelp} onRefresh={fetchList} />}
      />
    </PageContainer>
  );
}
