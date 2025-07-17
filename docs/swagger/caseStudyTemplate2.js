/**
 * @swagger
 * /api/v1/template/caseStudyTemplate2:
 *   post:
 *     summary: Create a new caseStudyTemplate2
 *     tags: [CaseStudyTemplate2]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyTemplate2'
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Page not found
 *
 *   get:
 *     summary: Get caseStudyTemplate2 by page ID
 *     tags: [CaseStudyTemplate2]
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
 * /api/v1/template/caseStudyTemplate2/list:
 *   get:
 *     summary: Get all caseStudyTemplate2 entries
 *     tags: [CaseStudyTemplate2]
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
 * /api/v1/template/caseStudyTemplate2/{id}:
 *   put:
 *     summary: Update specific fields of caseStudyTemplate2
 *     tags: [CaseStudyTemplate2]
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
 *             $ref: '#/components/schemas/CaseStudyTemplate2'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid input or no fields to update
 *       404:
 *         description: Template not found
 *
 *   delete:
 *     summary: Delete a caseStudyTemplate2
 *     tags: [CaseStudyTemplate2]
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
 * components:
 *   schemas:
 *     CaseStudyTemplate2:
 *       type: object
 *       properties:
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
 *         description4En:
 *           type: string
 *         description4Ar:
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
 *         resultImpactEn:
 *           type: string
 *         resultImpactAr:
 *           type: string
 *         technologiesUsedEn:
 *           type: string
 *         technologiesUsedAr:
 *           type: string
 *         pageId:
 *           type: string
 */
