/**
 * @swagger
 * components:
 *   schemas:
 *     Template3:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         seoDescriptionEn:
 *           type: string
 *         seoDescriptionAr:
 *           type: string
 *         isActive:
 *           type: boolean
 *         headingEn:
 *           type: string
 *         headingAr:
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
 *         image2:
 *           type: string
 *         image3:
 *           type: string
 *         buttonText1En:
 *           type: string
 *         buttonText1Ar:
 *           type: string
 *         buttonText2En:
 *           type: string
 *         buttonText2Ar:
 *           type: string
 *         buttonNavigation1En:
 *           type: string
 *         buttonNavigation1Ar:
 *           type: string
 *         buttonNavigation2En:
 *           type: string
 *         buttonNavigation2Ar:
 *           type: string
 *         pageId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/templates/template3:
 *   post:
 *     tags: [Templates]
 *     summary: Create a new template3
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nameEn
 *               - nameAr
 *               - pageId
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               pageId:
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
 *               # ... include all other properties
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template3'
 *
 *   get:
 *     tags: [Templates]
 *     summary: Get template3 by page ID
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template3'
 *
 * /api/templates/template3/{id}:
 *   put:
 *     tags: [Templates]
 *     summary: Update template3
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Template3'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *
 *   delete:
 *     tags: [Templates]
 *     summary: Delete template3
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Template deleted successfully
 */
