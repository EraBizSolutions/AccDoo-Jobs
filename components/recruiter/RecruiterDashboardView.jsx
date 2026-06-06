"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiFilter,
  FiGitBranch,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import RecruiterShell from "@/components/recruiter/RecruiterShell";
import { getRecruiterAtsOverview } from "@/lib/api/recruiterApi";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
];

const PIPELINE_KEYS = [
  { key: "screening", label: "Screening", color: "#F7C85D" },
  { key: "qualified", label: "Qualified", color: "#B877C8" },
  { key: "interview", label: "Interviews", color: "#6BC7E8" },
  { key: "offer", label: "Offer", color: "#F6A273" },
  { key: "hired", label: "Hired", color: "#8CBFAE" },
  { key: "offer_declined", label: "Offer Declined", color: "#EF4444" },
  { key: "rejected", label: "Rejected", color: "#F59AA0" },
];

const SOURCE_COLORS = ["#F7C85D", "#B877C8", "#6BC7E8", "#8CBFAE"];

function getLastDays(rows = [], days = 30) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(-days);
}

function getCountByStatus(pipelineCounts = []) {
  return pipelineCounts.reduce((accumulator, item) => {
    accumulator[item.status] = Number(item.count) || 0;
    return accumulator;
  }, {});
}

function getTotalEventsFromRows(rows = []) {
  return rows.reduce((total, row) => {
    return (
      total +
      PIPELINE_KEYS.reduce((statusTotal, item) => {
        return statusTotal + (Number(row[item.key]) || 0);
      }, 0)
    );
  }, 0);
}

function getVolumeRows(rows = []) {
  return rows.map((row) => ({
    label: row.label,
    applicants:
      Number(row.applied) +
      Number(row.screening) +
      Number(row.qualified) +
      Number(row.screening_disqualified) +
      Number(row.interview) +
      Number(row.shortlisted) +
      Number(row.offer) +
      Number(row.hired) +
      Number(row.offer_declined) +
      Number(row.rejected),
  }));
}

function getConversionRows(overview) {
  const totalApplications = Number(overview?.total_applications) || 0;
  const hiredCandidates = Number(overview?.hired_candidates) || 0;

  const statusCounts = getCountByStatus(overview?.pipeline_counts || []);

  return [
    {
      label: "Applied",
      applications: totalApplications,
    },
    {
      label: "Interview",
      interview: statusCounts.interview || 0,
    },
    {
      label: "Hired",
      hired: hiredCandidates,
    },
  ];
}

function MetricCard({ label, value, helper, icon, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-orange-100 bg-orange-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              highlight ? "text-[#F7631E]" : "text-[#98A2B3]"
            }`}
          >
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#0F172A]">
            {value}
          </p>

          {helper ? (
            <p className="mt-2 text-xs font-normal text-[#667085]">{helper}</p>
          ) : null}
        </div>

        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            highlight ? "bg-white text-[#F7631E]" : "bg-[#EAF5F1] text-[#2E8D76]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="text-xl font-semibold text-[#0F172A]">{title}</h2>

      {subtitle ? (
        <p className="mt-2 text-sm font-normal text-[#667085]">{subtitle}</p>
      ) : null}

      {children}
    </section>
  );
}

function PipelineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const visibleItems = payload.filter((item) => Number(item.value) > 0);

  return (
    <div className="rounded-lg bg-[#09091A] px-4 py-3 text-xs text-white shadow-xl">
      <p className="mb-2 font-semibold">{label}</p>

      {visibleItems.length ? (
        visibleItems.map((item) => (
          <div key={item.dataKey} className="mb-1 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="min-w-[110px]">{item.name}:</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))
      ) : (
        <p>No activity</p>
      )}
    </div>
  );
}

function SmallTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg bg-[#09091A] px-4 py-3 text-xs text-white shadow-xl">
      <p className="mb-2 font-semibold">{label}</p>

      {payload.map((item) => (
        <div key={item.dataKey || item.name} className="mb-1 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="min-w-[90px]">{item.name}:</span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function HiringPipelineChart({ data, counts, selectedRange, setSelectedRange }) {
  const totalEvents = getTotalEventsFromRows(data);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#0F172A]">
            Hiring pipeline
          </h2>

          <div className="mt-4 flex items-center gap-3">
            <p className="text-base font-normal text-[#0F172A]">
              {totalEvents} total events
            </p>
            <span className="text-xs font-medium text-green-600">▲ -</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {PIPELINE_KEYS.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-2 text-xs font-normal text-[#0F172A]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
                <span className="text-[#98A2B3]">{counts[item.key] || 0}</span>
              </span>
            ))}
          </div>

          <select
            value={selectedRange}
            onChange={(event) => setSelectedRange(Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-[#2E8D76] outline-none focus:border-[#2E8D76] focus:ring-4 focus:ring-emerald-50"
          >
            {RANGE_OPTIONS.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 h-[430px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={0} barCategoryGap="30%">
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#8A8F98" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#8A8F98" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<PipelineTooltip />} cursor={{ fill: "#EEF2F7" }} />

            {PIPELINE_KEYS.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                stackId="pipeline"
                fill={item.color}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function CandidateVolumeChart({ data }) {
  const totalApplicants = data.reduce(
    (sum, item) => sum + (Number(item.applicants) || 0),
    0
  );

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap gap-5">
        <span className="inline-flex items-center gap-2 text-sm text-[#0F172A]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6BC7E8]" />
          {totalApplicants} applicants
          <span className="text-[#CBD5E1]">-</span>
        </span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#8A8F98" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#8A8F98" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<SmallTooltip />} />
            <Line
              type="monotone"
              dataKey="applicants"
              name="Applications"
              stroke="#6BC7E8"
              strokeWidth={3}
              dot={{ r: 4, fill: "#6BC7E8" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConversionRatesChart({ data }) {
  return (
    <div className="mt-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="0%">
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#8A8F98" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#8A8F98" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<SmallTooltip />} />
            <Bar dataKey="applications" name="Applications" fill="#BDEDF6" />
            <Bar dataKey="interview" name="Interviews" fill="#D8B8E0" />
            <Bar dataKey="hired" name="Hired" fill="#C8DDD6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CandidateSourceChart({ data }) {
  const visibleData = Array.isArray(data)
    ? data.filter((item) => Number(item.value) > 0)
    : [];

  const safeData = visibleData.length
    ? visibleData
    : [{ label: "No source", value: 0 }];

  const total = safeData.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const hasData = total > 0;

  return (
    <DashboardPanel
      title="Candidate source"
      subtitle={`${total} total source${total === 1 ? "" : "s"}`}
      className="min-h-[420px]"
    >
      <div className="mt-6 grid min-h-[300px] items-center gap-8 lg:grid-cols-[260px_1fr]">
        <div className="relative mx-auto h-[260px] w-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={118}
                startAngle={90}
                endAngle={-270}
                paddingAngle={hasData ? 2 : 0}
                stroke="#ffffff"
                strokeWidth={4}
              >
                {safeData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={
                      hasData
                        ? SOURCE_COLORS[index % SOURCE_COLORS.length]
                        : "#E5E7EB"
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<SmallTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-sm font-normal text-[#667085]">Total</p>
              <p className="text-3xl font-semibold text-[#0F172A]">{total}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {hasData ? (
            safeData.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-[#F8FAFA] px-4 py-3"
              >
                <span className="inline-flex items-center gap-3 text-sm font-normal text-[#0F172A]">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        SOURCE_COLORS[index % SOURCE_COLORS.length],
                    }}
                  />
                  {item.label}
                </span>

                <span className="text-sm font-semibold text-[#0F172A]">
                  {item.value}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-[#F8FAFA] px-4 py-6 text-center">
              <p className="text-sm font-normal text-[#667085]">
                No candidate source data available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
}

function RejectionReasonsPanel() {
  return (
    <DashboardPanel
      title="Rejection reasons"
      subtitle="0 total sources"
      className="min-h-[420px]"
    >
      <div className="grid min-h-[330px] place-items-center">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-[3px] border-[#0F172A] text-2xl font-light text-[#0F172A]">
            /
          </div>

          <p className="mt-5 text-base font-normal text-[#0F172A]">
            No data available
          </p>

          <p className="mt-2 max-w-xs text-sm font-normal leading-6 text-[#667085]">
            Rejection analytics can appear here after rejection reasons are
            stored in the backend.
          </p>
        </div>
      </div>
    </DashboardPanel>
  );
}

function RecentApplicationRow({ application }) {
  const candidate = application.candidate || {};
  const job = application.job || {};

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">
          {candidate.name || "Candidate"}
        </p>

        <p className="mt-1 text-xs font-normal text-[#667085]">
          {job.title || "Job"} · {job.company_name || "Company"}
        </p>
      </div>

      <span className="rounded-full bg-[#EAF5F1] px-3 py-1 text-xs font-medium capitalize text-[#2E8D76]">
        {application.status}
      </span>
    </div>
  );
}

export default function RecruiterDashboardView() {
  const [overview, setOverview] = useState(null);
  const [selectedRange, setSelectedRange] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadOverview({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);
      const data = await getRecruiterAtsOverview();
      setOverview(data);

      if (showSuccessMessage) {
        setStatusMessage("Dashboard refreshed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load recruiter dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  const statusCounts = useMemo(
    () => getCountByStatus(overview?.pipeline_counts || []),
    [overview]
  );

  const visiblePipelineRows = useMemo(
    () => getLastDays(overview?.pipeline_daily || [], selectedRange),
    [overview, selectedRange]
  );

  const volumeRows = useMemo(
    () => getVolumeRows(visiblePipelineRows),
    [visiblePipelineRows]
  );

  const conversionRows = useMemo(
    () => getConversionRows(overview),
    [overview]
  );

  return (
    <RecruiterShell>
      <section>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F7631E]">
              Overview
            </p>

            <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#0F172A] md:text-[42px]">
              Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
              Track real application movement by day using recruiter ATS records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadOverview({ showSuccessMessage: true })}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#667085] shadow-sm transition hover:border-[#2E8D76] hover:text-[#2E8D76] disabled:opacity-60"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
              Refresh
            </button>

            <Link
              href="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2E8D76] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23725f]"
            >
              <FiPlus />
              Create new job
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total jobs"
            value={isLoading ? "..." : overview?.total_jobs || 0}
            helper="All recruiter jobs"
            icon={<FiBriefcase size={20} />}
            highlight
          />

          <MetricCard
            label="Active jobs"
            value={isLoading ? "..." : overview?.active_jobs || 0}
            helper="Visible on job board"
            icon={<FiCheckCircle size={20} />}
          />

          <MetricCard
            label="Applications"
            value={isLoading ? "..." : overview?.total_applications || 0}
            helper="Real submitted applications"
            icon={<FiUsers size={20} />}
          />

          <MetricCard
            label="Hired"
            value={isLoading ? "..." : overview?.hired_candidates || 0}
            helper="Candidates moved to hired"
            icon={<FiTrendingUp size={20} />}
          />
        </div>

        {isLoading ? (
          <DashboardPanel title="Hiring pipeline" className="mt-8">
            <p className="mt-5 text-sm text-[#667085]">Loading chart...</p>
          </DashboardPanel>
        ) : (
          <HiringPipelineChart
            data={visiblePipelineRows}
            counts={statusCounts}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
          />
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <DashboardPanel title="Candidate volume">
            <CandidateVolumeChart data={volumeRows} />
          </DashboardPanel>

          <DashboardPanel title="Conversion rates">
            <ConversionRatesChart data={conversionRows} />
          </DashboardPanel>
        </div>

        <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-2">
          <CandidateSourceChart data={overview?.candidate_sources || []} />
          <RejectionReasonsPanel />
        </div>

        <div className="mt-6">
          <DashboardPanel
            title="Recent applications"
            subtitle="Latest candidate activity."
          >
            <div className="mt-3">
              {isLoading ? (
                <p className="text-sm text-[#667085]">
                  Loading applications...
                </p>
              ) : overview?.recent_applications?.length ? (
                overview.recent_applications.map((application) => (
                  <RecentApplicationRow
                    key={application.id}
                    application={application}
                  />
                ))
              ) : (
                <p className="rounded-xl bg-[#F8FAFA] p-5 text-sm text-[#667085]">
                  No recent applications yet.
                </p>
              )}
            </div>
          </DashboardPanel>
        </div>
      </section>
    </RecruiterShell>
  );
}