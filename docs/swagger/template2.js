/**
 * @swagger
 * components:
 *   schemas:
 *     Template2:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - pageId
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         nameEn:
 *           type: string
 *           description: Name in English
 *         nameAr:
 *           type: string
 *           description: Name in Arabic
 *         seoDescriptionEn:
 *           type: string
 *           description: SEO description in English
 *         seoDescriptionAr:
 *           type: string
 *           description: SEO description in Arabic
 *         isActive:
 *           type: boolean
 *           default: true
 *         headingEn:
 *           type: string
 *           description: Heading in English
 *         headingAr:
 *           type: string
 *           description: Heading in Arabic
 *         description1En:
 *           type: string
 *           description: First description in English
 *         description1Ar:
 *           type: string
 *           description: First description in Arabic
 *         description2En:
 *           type: string
 *           description: Second description in English
 *         description2Ar:
 *           type: string
 *           description: Second description in Arabic
 *         description3En:
 *           type: string
 *           description: Third description in English
 *         description3Ar:
 *           type: string
 *           description: Third description in Arabic
 *         buttonTextEn:
 *           type: string
 *           description: Button text in English
 *         buttonTextAr:
 *           type: string
 *           description: Button text in Arabic
 *         buttonNavigationEn:
 *           type: string
 *           description: Button navigation link in English
 *         buttonNavigationAr:
 *           type: string
 *           description: Button navigation link in Arabic
 *         image1:
 *           type: string
 *           format: binary
 *         image2:
 *           type: string
 *           format: binary
 *         image3:
 *           type: string
 *           format: binary
 *         pageId:
 *           type: string
 *           description: ID of the associated page
 *
 * /api/v1/template/template2:
 *   post:
 *     summary: Create a new template2
 *     tags: [Templates2]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template2'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get template2 by page ID
 *     tags: [Templates2]
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
 * /api/v1/template/template2/list:
 *   get:
 *     summary: Get all template2 entries
 *     tags: [Templates2]
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
 * /api/v1/template/template2/{id}:
 *   put:
 *     summary: Update specific fields of template2
 *     tags: [Templates2]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               pageId:
 *                 type: string
 *               seoDescriptionEn:
 *                 type: string
 *               seoDescriptionAr:
 *                 type: string
 *               headingEn:
 *                 type: string
 *               headingAr:
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
 *               buttonTextEn:
 *                 type: string
 *               buttonTextAr:
 *                 type: string
 *               buttonNavigationEn:
 *                 type: string
 *               buttonNavigationAr:
 *                 type: string
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
 *         description: Invalid input or no fields to update
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a template2
 *     tags: [Templates2]
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
 * /api/v1/template/template2/slug:
 *   get:
 *     summary: Get template2 by slug
 *     tags: [Templates2]
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
 */
