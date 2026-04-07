"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleStyleRule } from "@/app/(admin)/admin/actions";
import type { StyleGuideRule } from "@/types/database";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-50 text-red-600",
  high: "bg-orange-50 text-orange-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-zinc-100 text-zinc-500",
};

interface RuleRowProps {
  rule: StyleGuideRule;
}

function RuleRow({ rule }: RuleRowProps) {
  const [active, setActive] = useState(rule.is_active);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      try {
        await toggleStyleRule(rule.id, next);
      } catch {
        setActive(!next);
        toast.error("Failed to update rule");
      }
    });
  }

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="py-3 px-4 text-sm text-zinc-700 max-w-xs">
        <p className={active ? "" : "line-through text-zinc-400"}>{rule.rule}</p>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[10px] font-medium capitalize">
          {rule.category}
        </span>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
            SEVERITY_STYLES[rule.severity] ?? "bg-zinc-100 text-zinc-500"
          }`}
        >
          {rule.severity}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-zinc-400">
        {rule.universe ?? "—"}
      </td>
      <td className="py-3 px-4">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
            active ? "bg-amber-500" : "bg-zinc-200"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={active ? "Deactivate rule" : "Activate rule"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              active ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </td>
    </tr>
  );
}

interface StyleRulesPanelProps {
  rules: StyleGuideRule[];
}

export function StyleRulesPanel({ rules }: StyleRulesPanelProps) {
  const [search, setSearch] = useState("");
  const filtered = rules.filter(
    (r) =>
      r.rule.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">{rules.length} rules</p>
        <input
          type="text"
          placeholder="Search rules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 w-48"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Rule
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Category
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Universe
              </th>
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Active
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                  No rules found
                </td>
              </tr>
            ) : (
              filtered.map((rule) => <RuleRow key={rule.id} rule={rule} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
