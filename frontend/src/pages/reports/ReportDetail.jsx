import { useState, useEffect } from 'react';
import { useParams, Link }     from 'react-router-dom';
import * as reportApi          from '../../api/report.api';
import Card                    from '../../components/Card';
import Button                  from '../../components/Button';
import { formatDateTime, formatHours } from '../../utils/formatters';

const PRESETS = ['week','2weeks','month'];

const ReportDetail = () => {
  const { userId }  = useParams();
  const [report,    setReport]  = useState(null);
  const [preset,    setPreset]  = useState('week');
  const [loading,   setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error,     setError]   = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    reportApi.getUserReport(userId, { preset })
      .then(r => setReport(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [userId, preset]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res  = await reportApi.downloadCSV(userId, { preset });
      const url  = URL.createObjectURL(res.data);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `syncshift_report_${userId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    } finally { setExporting(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', padding:'24px' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontWeight:'800', fontSize:'22px' }}>Individual Report</h2>
          <Link to="/reports" style={{ fontSize:'14px' }}>← Reports</Link>
        </div>

        {/* Preset selector */}
        <Card style={{ marginBottom:'16px' }}>
          <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontWeight:'600', fontSize:'14px', marginRight:'8px' }}>Period:</span>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setPreset(p)} style={{
                padding:'6px 16px', borderRadius:'999px', fontSize:'13px', fontWeight:'600', cursor:'pointer',
                background: preset===p ? '#1a56db' : '#f3f4f6',
                color:      preset===p ? '#fff'     : '#374151',
                border: preset===p ? 'none' : '1px solid #e5e7eb',
              }}>{p}</button>
            ))}
            <Button loading={exporting} onClick={handleExport} variant="secondary"
              style={{ marginLeft:'auto', padding:'6px 16px', fontSize:'13px' }}>
              Export CSV
            </Button>
          </div>
        </Card>

        {loading && <p style={{ color:'#6b7280', padding:'24px' }}>Loading report...</p>}
        {error   && <p className="error" style={{ padding:'24px' }}>{error}</p>}

        {report && !loading && (
          <>
            {/* User info */}
            <Card style={{ marginBottom:'16px' }}>
              <p style={{ fontWeight:'700', fontSize:'16px' }}>{report.user.name}</p>
              <p style={{ color:'#6b7280', fontSize:'14px' }}>{report.user.email}</p>
            </Card>

            {/* Summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px,1fr))', gap:'12px', marginBottom:'16px' }}>
              {[
                ['Days Present',    report.summary.total_days_present],
                ['Total Hours',     `${report.summary.total_hours_worked} hrs`],
                ['Avg / Day',       `${report.summary.average_hours_per_day} hrs`],
                ['Late Days',       report.summary.days_late],
                ['Missing Signout', report.summary.missing_signout_count],
              ].map(([label, value]) => (
                <Card key={label} style={{ textAlign:'center', padding:'16px' }}>
                  <p style={{ fontSize:'22px', fontWeight:'800', color:'#1a56db' }}>{value}</p>
                  <p style={{ fontSize:'12px', color:'#6b7280', marginTop:'4px' }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Records table */}
            <Card>
              <h3 style={{ fontWeight:'700', marginBottom:'16px' }}>Session Records</h3>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid #e5e7eb' }}>
                      {['Sign In','Sign Out','Hours','Late','Note'].map(h => (
                        <th key={h} style={{ padding:'8px', textAlign:'left', color:'#6b7280', fontWeight:'600' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.records.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom:'1px solid #f3f4f6', background: i%2===0?'#fff':'#f9fafb' }}>
                        <td style={{ padding:'8px' }}>{formatDateTime(s.signed_in_at)}</td>
                        <td style={{ padding:'8px' }}>{s.signed_out_at ? formatDateTime(s.signed_out_at) : <span style={{color:'#dc2626'}}>Missing</span>}</td>
                        <td style={{ padding:'8px' }}>{formatHours(s.hours_worked)}</td>
                        <td style={{ padding:'8px' }}>{s.is_late ? <span style={{color:'#d97706'}}>Yes</span> : 'No'}</td>
                        <td style={{ padding:'8px', color:'#6b7280' }}>{s.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;
