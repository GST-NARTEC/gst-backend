/**
 * @swagger
 * components:
 *   schemas:
 *     WhyBarcode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         titleEn:
 *           type: string
 *         titleAr:
 *           type: string
 *         descriptionEn:
 *           type: string
 *         descriptionAr:
 *           type: string
 *         image:
 *           type: string
 *         captionEn:
 *           type: string
 *         captionAr:
 *           type: string
 *         isActive:
 *           type: boolean
 *         pageId:
 *           type: string
 *           description: ID of the associated page
 *         page:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nameEn:
 *               type: string
 *             nameAr:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/v1/whybarcode:
 *   get:
 *     tags: [Why Barcode]
 *     summary: Get all why barcodes
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WhyBarcode'
 *
 *   post:
 *     tags: [Why Barcode]
 *     summary: Create a new why barcode
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionAr:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               captionEn:
 *                 type: string
 *               captionAr:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               pageId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Why Barcode created successfully
 *
 * /api/v1/whybarcode/active:
 *   get:
 *     tags: [Why Barcode]
 *     summary: Get active why barcodes
 *     responses:
 *       200:
 *         description: Success
 *
 * /api/v1/whybarcode/{id}:
 *   get:
 *     tags: [Why Barcode]
 *     summary: Get why barcode by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *
 *   put:
 *     tags: [Why Barcode]
 *     summary: Update why barcode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionAr:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               captionEn:
 *                 type: string
 *               captionAr:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *
 *   delete:
 *     tags: [Why Barcode]
 *     summary: Delete why barcode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
