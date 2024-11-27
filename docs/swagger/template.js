/**
 * @swagger
 * components:
 *   schemas:
 *     Template1:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         isActive:
 *           type: boolean
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
 *         image2:
 *           type: string
 *         image3:
 *           type: string
 *         pageId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/template/v1:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     parameters:
 *       - in: query
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
 *             required:
 *               - nameEn
 *               - nameAr
 *               - slug
 *               - pageId
 *             properties:
 *               nameEn:
 *                 type: string
 *               nameAr:
 *                 type: string
 *               slug:
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
 *               pageId:
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
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get template by slug
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [template1, template2, template3, template4, template5, template6, template7]
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 *       400:
 *         description: Invalid template type
 *
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
 *               pageId:
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
 *       400:
 *         description: Invalid input data or template type
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
 *       400:
 *         description: Invalid template type
 *       404:
 *         description: Template not found
 */
