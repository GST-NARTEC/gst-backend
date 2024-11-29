/**
 * @swagger
 * components:
 *   schemas:
 *     Template1Create:
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
 *         seoDescriptionEn:
 *           type: string
 *         seoDescriptionAr:
 *           type: string
 *         description1En:
 *           type: string
 *         description1Ar:
 *           type: string
 *         description2En:
 *           type: string
 *         description2Ar:
 *           type: string
 *         description3En:
 *           type: string
 *         description3Ar:
 *           type: string
 *         image1:
 *           type: string
 *           format: binary
 *         image2:
 *           type: string
 *           format: binary
 *         image3:
 *           type: string
 *           format: binary
 *
 * /api/template/v1/template1:
 *   post:
 *     summary: Create a new template1
 *     tags: [Template1]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template1Create'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input or template already exists for page
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get template1 by page ID
 *     tags: [Template1]
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *
 * /api/template/v1/template1/list:
 *   get:
 *     summary: Get all template1 entries
 *     tags: [Template1]
 *     parameters:
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
 * /api/template/v1/template1/{id}:
 *   put:
 *     summary: Update a template1
 *     tags: [Template1]
 *     parameters:
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
 *             $ref: '#/components/schemas/Template1Create'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a template1
 *     tags: [Template1]
 *     parameters:
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
 *
 */
