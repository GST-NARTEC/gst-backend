/**
 * @swagger
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
 *         nameAr:
 *           type: string
 *         isActive:
 *           type: boolean
 *           default: true
 *         pageId:
 *           type: string
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
 *
 *     Template2:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseTemplate'
 *         - type: object
 *           properties:
 *             seoDescriptionEn:
 *               type: string
 *             seoDescriptionAr:
 *               type: string
 *             headingEn:
 *               type: string
 *             headingAr:
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
 *
 * /api/templates/{templateType}:
 *   post:
 *     tags:
 *       - Templates
 *     summary: Create a new template
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
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
 *               pageId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               seoDescriptionEn:
 *                 type: string
 *               seoDescriptionAr:
 *                 type: string
 *               description1En:
 *                 type: string
 *               description1Ar:
 *                 type: string
 *               description2En:
 *                 type: string
 *               description2Ar:
 *                 type: string
 *               description3En:
 *                 type: string
 *               description3Ar:
 *                 type: string
 *               image1:
 *                 type: file
 *               image2:
 *                 type: file
 *               image3:
 *                 type: file
 *     responses:
 *       201:
 *         description: Template created successfully
 *
 * /api/templates/{templateType}/list:
 *   get:
 *     tags:
 *       - Templates
 *     summary: Get list of templates by type
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved templates
 *
 * /api/templates/{templateType}/{id}:
 *   put:
 *     tags:
 *       - Templates
 *     summary: Update a template
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
 *               pageId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               seoDescriptionEn:
 *                 type: string
 *               seoDescriptionAr:
 *                 type: string
 *               description1En:
 *                 type: string
 *               description1Ar:
 *                 type: string
 *               description2En:
 *                 type: string
 *               description2Ar:
 *                 type: string
 *               description3En:
 *                 type: string
 *               description3Ar:
 *                 type: string
 *               image1:
 *                 type: file
 *               image2:
 *                 type: file
 *               image3:
 *                 type: file
 *     responses:
 *       200:
 *         description: Template updated successfully
 *
 *   delete:
 *     tags:
 *       - Templates
 *     summary: Delete a template
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
 */
