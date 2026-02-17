import { useState, useEffect } from 'react'
import { supabase, logActivity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

const roleBadge = {
  admin: 'bg-red-100 text-red-700',
  researcher: 'bg-blue-100 text-blue-700',
  coordinator: 'bg-purple-100 text-purple-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const roleOptions = ['admin', 'researcher', 'coordinator', 'viewer']

export default function MembersPage() {
  const { role } = useAuth()
  const { lang } = useLang()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = role === 'admin'

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, approved, created_at, institution')
      .order('created_at', { ascending: false })
    setMembers(data || [])
    setLoading(false)
  }

  async function handleApprove(member) {
    await supabase
      .from('profiles')
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
      })
      .eq('id', member.id)
    await logActivity('member_approved', member.full_name || member.email)

    // Send welcome email via Edge Function
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: member.email,
          name: member.full_name || '',
        },
      })
    } catch {
      // Edge Function not deployed yet — approval still works
    }

    fetchMembers()
  }

  async function handleReject(member) {
    const msg = lang === 'ko'
      ? `${member.full_name || member.email}의 가입 신청을 거절하시겠습니까? 프로필이 삭제됩니다.`
      : `Reject ${member.full_name || member.email}? Their profile will be deleted.`
    if (!confirm(msg)) return

    await supabase.from('profiles').delete().eq('id', member.id)
    await logActivity('member_rejected', member.full_name || member.email)
    fetchMembers()
  }

  async function handleRevoke(member) {
    const msg = lang === 'ko'
      ? `${member.full_name}의 승인을 취소하시겠습니까?`
      : `Revoke approval for ${member.full_name}?`
    if (!confirm(msg)) return

    await supabase
      .from('profiles')
      .update({ approved: false, approved_at: null })
      .eq('id', member.id)
    await logActivity('member_revoked', member.full_name || member.email)
    fetchMembers()
  }

  async function changeRole(memberId, newRole) {
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId)
    fetchMembers()
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  const pendingMembers = members.filter((m) => !m.approved)
  const approvedMembers = members.filter((m) => m.approved)

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === 'ko' ? '회원 관리' : 'Members'}
        </h1>
        <p className="mt-1 text-base text-slate-500">
          {lang === 'ko'
            ? `총 ${members.length}명 (승인 대기 ${pendingMembers.length}명)`
            : `${members.length} total (${pendingMembers.length} pending)`}
        </p>

        {/* Pending approvals */}
        {pendingMembers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-yellow-700">
              {lang === 'ko' ? '승인 대기' : 'Pending Approval'}
            </h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-yellow-200 bg-yellow-50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-yellow-200">
                    <TableHead className="py-3 px-4">{lang === 'ko' ? '이름' : 'Name'}</TableHead>
                    <TableHead className="py-3 px-4">{lang === 'ko' ? '이메일' : 'Email'}</TableHead>
                    <TableHead className="py-3 px-4">{lang === 'ko' ? '소속' : 'Institution'}</TableHead>
                    <TableHead className="py-3 px-4">{lang === 'ko' ? '가입일' : 'Joined'}</TableHead>
                    {isAdmin && <TableHead className="py-3 px-4">{lang === 'ko' ? '관리' : 'Action'}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMembers.map((m) => (
                    <TableRow key={m.id} className="border-b border-yellow-100">
                      <TableCell className="py-3 px-4 font-medium text-slate-900">{m.full_name || '-'}</TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-600">{m.email || '-'}</TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">{m.institution || '-'}</TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-500">
                        {new Date(m.created_at).toLocaleDateString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(m)} className="bg-green-600 hover:bg-green-700">
                              {lang === 'ko' ? '승인' : 'Approve'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(m)}>
                              {lang === 'ko' ? '거절' : 'Reject'}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Approved members */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {lang === 'ko' ? '승인된 회원' : 'Approved Members'}
          </h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4">{lang === 'ko' ? '이름' : 'Name'}</TableHead>
                  <TableHead className="py-3 px-4">{lang === 'ko' ? '소속' : 'Institution'}</TableHead>
                  <TableHead className="py-3 px-4">{lang === 'ko' ? '등급' : 'Role'}</TableHead>
                  <TableHead className="py-3 px-4">{lang === 'ko' ? '가입일' : 'Joined'}</TableHead>
                  {isAdmin && <TableHead className="py-3 px-4">{lang === 'ko' ? '관리' : 'Actions'}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="py-3 px-4 font-medium text-slate-900">{m.full_name || '-'}</TableCell>
                    <TableCell className="py-3 px-4 text-slate-600">{m.institution || '-'}</TableCell>
                    <TableCell className="py-3 px-4">
                      {isAdmin ? (
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.id, e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant="secondary" className={roleBadge[m.role] || roleBadge.viewer}>
                          {m.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => handleRevoke(m)} className="text-red-600 hover:text-red-700">
                          {lang === 'ko' ? '승인 취소' : 'Revoke'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
