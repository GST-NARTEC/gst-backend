/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: Template management endpoints
 *
 * components:
 *   schemas:
 *     BaseTemplate:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - pageId
 *       properties:
 *         nameEn:
 *           type: string
 *           description: Template name in English
 *         nameAr:
 *           type: string
 *           description: Template name in Arabic
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Template status
 *         pageId:
 *           type: string
 *           description: Associated page ID
 *
 *     Template1:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseTemplate'
 *         - type: object
 *           properties:
 *             seoDescriptionEn:
 *               type: string
 *             seoDescriptionAr:
 *               type: string
 *             description1En:
 *               type: string
 *             description1Ar:
 *               type: string
 *             description2En:
 *               type: string
 *             description2Ar:
 *               type: string
 *             description3En:
 *               type: string
 *             description3Ar:
 *               type: string
 *             image1:
 *               type: string
 *               format: binary
 *             image2:
 *               type: string
 *               format: binary
 *             image3:
 *               type: string
 *               format: binary
 *
 * /api/templates/{templateType}:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
 *         description: Type of template to create
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template1'
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     template:
 *                       $ref: '#/components/schemas/Template1'
 *       400:
 *         description: Invalid input or template type
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get template by page ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
 *       - in: query
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     template:
 *                       $ref: '#/components/schemas/Template1'
 *       404:
 *         description: Template not found
 *
 * /api/templates/{templateType}/{id}:
 *   put:
 *     summary: Update a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               slug:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               image1:
 *                 type: string
 *                 format: binary
 *               image2:
 *                 type: string
 *                 format: binary
 *               image3:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */
