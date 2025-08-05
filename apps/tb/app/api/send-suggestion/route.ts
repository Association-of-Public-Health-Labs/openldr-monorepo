import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_NiP8vaUtz51YOUmzipvhFvT0bEbj1JKTMWmXUF");

export async function POST(request: NextRequest) {
  try {
    const { content, category, reportTitle, userEmail, userName } = await request.json();

    // Get email addresses from environment variable
    const emailAddresses = process.env.SUGGESTION_EMAILS?.split(',').map(email => email.trim()) || [];
    const categoryText = category === "suggestion" ? "Sugestão" : "Dúvida";

    if (emailAddresses.length === 0) {
      return NextResponse.json(
        { error: 'No email addresses configured' },
        { status: 500 }
      );
    }

    const emailContent = `
      <h2>${categoryText}: ${reportTitle}</h2>
      <p><strong>Usuário:</strong> ${userName} (${userEmail})</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      <hr>
      <div>${content}</div>
    `;

    const { data, error } = await resend.emails.send({
      from: `Dashboard de TB <${process.env.DASHBOARD_EMAIL}>`,
      to: emailAddresses,
      subject: `[${categoryText}] ${reportTitle} - Dashboard de TB`,
      html: emailContent,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}