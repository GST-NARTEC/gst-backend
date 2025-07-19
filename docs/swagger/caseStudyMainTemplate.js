/**
 * @swagger
 * /api/v1/template/caseStudyMainTemplate:
 *   post:
 *     summary: Create a new caseStudyMainTemplate
 *     tags: [CaseStudyMainTemplate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyMainTemplate'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get caseStudyMainTemplate by page ID
 *     tags: [CaseStudyMainTemplate]
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *         description: Page ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *
 * /api/v1/template/caseStudyMainTemplate/list:
 *   get:
 *     summary: Get all caseStudyMainTemplate entries
 *     tags: [CaseStudyMainTemplate]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *
 * /api/v1/template/caseStudyMainTemplate/{id}:
 *   put:
 *     summary: Update specific fields of caseStudyMainTemplate
 *     tags: [CaseStudyMainTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyMainTemplate'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid input or no fields to update
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a caseStudyMainTemplate
 *     tags: [CaseStudyMainTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 *
 * /api/v1/template/caseStudyMainTemplate/slug:
 *   get:
 *     summary: Get caseStudyMainTemplate by slug
 *     tags: [CaseStudyMainTemplate]
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Page slug
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *
 * components:
 *   schemas:
 *     CaseStudyMainTemplate:
 *       type: object
 *       properties:
 *         headerEn:
 *           type: string
 *         headerAr:
 *           type: string
 *         footerEn:
 *           type: string
 *         footerAr:
 *           type: string
 *         pageId:
 *           type: string
 */
