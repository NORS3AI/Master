/**
 * Phase 4.1: Email API Routes
 * Handles email templates and campaigns
 */

/**
 * Register email routes with the Hono app
 * @param {Hono} app - The Hono app instance
 */
function registerEmailRoutes(app) {

  // GET /api/email/templates - Get all email templates (admin only)
  app.get('/api/email/templates', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { category, isActive } = c.req.query();

      let query = 'SELECT * FROM email_templates WHERE 1=1';
      const params = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(isActive === 'true' ? 1 : 0);
      }

      query += ' ORDER BY name ASC';

      const templates = await c.env.DB.prepare(query).bind(...params).all();

      return c.json({
        templates: (templates.results || []).map(t => ({
          ...t,
          variables: JSON.parse(t.variables || '[]')
        }))
      });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return c.json({ error: 'Failed to fetch templates' }, 500);
    }
  });

  // GET /api/email/templates/:id - Get single template
  app.get('/api/email/templates/:id', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();

      const template = await c.env.DB.prepare(
        'SELECT * FROM email_templates WHERE id = ?'
      ).bind(id).first();

      if (!template) {
        return c.json({ error: 'Template not found' }, 404);
      }

      return c.json({
        ...template,
        variables: JSON.parse(template.variables || '[]')
      });
    } catch (error) {
      console.error('Error fetching email template:', error);
      return c.json({ error: 'Failed to fetch template' }, 500);
    }
  });

  // POST /api/email/templates - Create email template
  app.post('/api/email/templates', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { name, subject, htmlContent, textContent, category, variables } = await c.req.json();

      if (!name || !subject || !htmlContent) {
        return c.json({ error: 'Name, subject, and htmlContent are required' }, 400);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO email_templates (id, name, subject, htmlContent, textContent, category, variables, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(
        id,
        name,
        subject,
        htmlContent,
        textContent || null,
        category || 'transactional',
        JSON.stringify(variables || []),
        now,
        now
      ).run();

      return c.json({ id, success: true }, 201);
    } catch (error) {
      console.error('Error creating email template:', error);
      if (error.message?.includes('UNIQUE constraint')) {
        return c.json({ error: 'Template with this name already exists' }, 409);
      }
      return c.json({ error: 'Failed to create template' }, 500);
    }
  });

  // PATCH /api/email/templates/:id - Update email template
  app.patch('/api/email/templates/:id', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();
      const updates = await c.req.json();
      const now = Date.now();

      const allowedFields = ['name', 'subject', 'htmlContent', 'textContent', 'category', 'variables', 'isActive'];
      const setClauses = [];
      const values = [];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          if (field === 'variables') {
            values.push(JSON.stringify(updates[field]));
          } else {
            values.push(updates[field]);
          }
        }
      }

      if (setClauses.length === 0) {
        return c.json({ error: 'No valid fields to update' }, 400);
      }

      setClauses.push('updatedAt = ?');
      values.push(now);
      values.push(id);

      await c.env.DB.prepare(
        `UPDATE email_templates SET ${setClauses.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating email template:', error);
      return c.json({ error: 'Failed to update template' }, 500);
    }
  });

  // DELETE /api/email/templates/:id - Delete email template
  app.delete('/api/email/templates/:id', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(
        'DELETE FROM email_templates WHERE id = ?'
      ).bind(id).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting email template:', error);
      return c.json({ error: 'Failed to delete template' }, 500);
    }
  });

  // POST /api/email/templates/:id/preview - Preview email with sample data
  app.post('/api/email/templates/:id/preview', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();
      const sampleData = await c.req.json();

      const template = await c.env.DB.prepare(
        'SELECT * FROM email_templates WHERE id = ?'
      ).bind(id).first();

      if (!template) {
        return c.json({ error: 'Template not found' }, 404);
      }

      // Replace variables in template
      let html = template.htmlContent;
      let text = template.textContent || '';
      let subject = template.subject;

      for (const [key, value] of Object.entries(sampleData)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
        text = text.replace(regex, value);
        subject = subject.replace(regex, value);
      }

      return c.json({
        subject,
        html,
        text
      });
    } catch (error) {
      console.error('Error previewing email template:', error);
      return c.json({ error: 'Failed to preview template' }, 500);
    }
  });

  // GET /api/email/campaigns - Get all campaigns (admin only)
  app.get('/api/email/campaigns', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { status, page = 1, limit = 20 } = c.req.query();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = 'SELECT * FROM email_campaigns WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const campaigns = await c.env.DB.prepare(query).bind(...params).all();

      return c.json({
        campaigns: (campaigns.results || []).map(c => ({
          ...c,
          recipientFilter: JSON.parse(c.recipientFilter || '{}')
        })),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return c.json({ error: 'Failed to fetch campaigns' }, 500);
    }
  });

  // POST /api/email/campaigns - Create email campaign
  app.post('/api/email/campaigns', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { name, templateId, subject, recipientFilter, scheduledAt } = await c.req.json();

      if (!name || !templateId || !subject) {
        return c.json({ error: 'Name, templateId, and subject are required' }, 400);
      }

      // Verify template exists
      const template = await c.env.DB.prepare(
        'SELECT id FROM email_templates WHERE id = ?'
      ).bind(templateId).first();

      if (!template) {
        return c.json({ error: 'Template not found' }, 404);
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await c.env.DB.prepare(`
        INSERT INTO email_campaigns (id, name, templateId, subject, recipientFilter, status, scheduledAt, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        name,
        templateId,
        subject,
        JSON.stringify(recipientFilter || {}),
        scheduledAt ? 'scheduled' : 'draft',
        scheduledAt || null,
        userId,
        now
      ).run();

      return c.json({ id, success: true }, 201);
    } catch (error) {
      console.error('Error creating campaign:', error);
      return c.json({ error: 'Failed to create campaign' }, 500);
    }
  });

  // PATCH /api/email/campaigns/:id - Update campaign
  app.patch('/api/email/campaigns/:id', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();
      const updates = await c.req.json();

      // Check campaign status - can't update sent campaigns
      const campaign = await c.env.DB.prepare(
        'SELECT status FROM email_campaigns WHERE id = ?'
      ).bind(id).first();

      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      if (campaign.status === 'sent') {
        return c.json({ error: 'Cannot update a sent campaign' }, 400);
      }

      const allowedFields = ['name', 'templateId', 'subject', 'recipientFilter', 'status', 'scheduledAt'];
      const setClauses = [];
      const values = [];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          if (field === 'recipientFilter') {
            values.push(JSON.stringify(updates[field]));
          } else {
            values.push(updates[field]);
          }
        }
      }

      if (setClauses.length === 0) {
        return c.json({ error: 'No valid fields to update' }, 400);
      }

      values.push(id);

      await c.env.DB.prepare(
        `UPDATE email_campaigns SET ${setClauses.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating campaign:', error);
      return c.json({ error: 'Failed to update campaign' }, 500);
    }
  });

  // POST /api/email/campaigns/:id/send - Send campaign now
  app.post('/api/email/campaigns/:id/send', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();

      const campaign = await c.env.DB.prepare(
        'SELECT * FROM email_campaigns WHERE id = ?'
      ).bind(id).first();

      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      if (campaign.status === 'sent') {
        return c.json({ error: 'Campaign already sent' }, 400);
      }

      // TODO: Implement actual email sending logic
      // For now, just mark as sent
      const now = Date.now();

      await c.env.DB.prepare(`
        UPDATE email_campaigns SET status = 'sent', sentAt = ? WHERE id = ?
      `).bind(now, id).run();

      return c.json({
        success: true,
        message: 'Campaign queued for sending'
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      return c.json({ error: 'Failed to send campaign' }, 500);
    }
  });

  // DELETE /api/email/campaigns/:id - Delete campaign
  app.delete('/api/email/campaigns/:id', async (c) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');

      if (!userId || userRole !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { id } = c.req.param();

      await c.env.DB.prepare(
        'DELETE FROM email_campaigns WHERE id = ?'
      ).bind(id).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return c.json({ error: 'Failed to delete campaign' }, 500);
    }
  });
}

/**
 * Render an email template with data
 * @param {D1Database} db - The D1 database instance
 * @param {string} templateName - Name of the template
 * @param {Object} data - Data to replace in template
 */
async function renderEmailTemplate(db, templateName, data) {
  const template = await db.prepare(
    'SELECT * FROM email_templates WHERE name = ? AND isActive = 1'
  ).bind(templateName).first();

  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  let html = template.htmlContent;
  let text = template.textContent || '';
  let subject = template.subject;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
    text = text.replace(regex, value);
    subject = subject.replace(regex, value);
  }

  return { subject, html, text };
}

export { registerEmailRoutes, renderEmailTemplate };
