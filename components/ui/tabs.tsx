"use client";
import clsx from "clsx";
import * as React from "react";

export function Tabs({ defaultValue, children, className }:{ defaultValue:string; children:React.ReactNode; className?:string }) {
  const [value, setValue] = React.useState(defaultValue);
  return <div className={className} data-value={value}>{React.Children.map(children, (child:any) => React.cloneElement(child, { value, setValue }))}</div>;
}
export function TabsList({ children, value }:{ children:any; value?:string }) {
  return <div className="inline-flex gap-1 border border-border rounded-md p-1">{children}</div>;
}
export function TabsTrigger({ children, value: tab, setValue, value }:{ children:any; value:string; setValue?:(v:string)=>void; }) {
  const active = (childProps:any) => childProps?.value === value; // noop
  return (
    <button onClick={()=>setValue?.(value!)} className={clsx("px-3 py-1.5 rounded-md text-sm", (tab===value) && "bg-[#16161A] border border-border")}>
      {children}
    </button>
  );
}
export function TabsContent({ children, value: tab, ...props }:{ children:any; value:string }) {
  // naive: render all, hide unmatched
  return <div className={props?.["data-value"]===tab ? "" : "hidden"}>{children}</div>;
}

