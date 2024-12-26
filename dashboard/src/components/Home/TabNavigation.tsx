"use client";
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TabItem {
  id: number;
  label: string;
  content: React.ReactNode;
}

interface TabNavigationProps {
  tabItems: TabItem[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabItems }) => {
  return (
    <div className="h-[calc(100vh-23rem)]">
      <Tabs
        defaultValue={tabItems[0].id.toString()}
        className="h-full flex flex-col"
      >
        <TabsList className="h-auto p-0 bg-transparent rounded-none">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id.toString()}
              className="text-xl px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabItems.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id.toString()}
            className="flex-1 m-0 p-0 data-[state=active]:border-none"
          >
            <ScrollArea className="h-[calc(100vh-28rem)] w-full">
              <CardContent className="p-4">{tab.content}</CardContent>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabNavigation;
