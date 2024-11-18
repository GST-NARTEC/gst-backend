/**
 * @swagger
 * components:
 *   schemas:
 *     License:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         license:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         document:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   name: License
 *   description: License management endpoints
 *
 * /api/license/v1/verify:
 *   post:
 *     summary: Verify a license key
 *     tags: [License]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licenseKey
 *             properties:
 *               licenseKey:
 *                 type: string
 *                 description: The license key to verify
 *     responses:
 *       200:
 *         description: License verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     license:
 *                       $ref: '#/components/schemas/License'
 *       400:
 *         description: Bad request
 *       404:
 *         description: License not found
 *
 * /api/license/v1:
 *   post:
 *     summary: Add a new license
 *     tags: [License]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - license
 *               - document
 *             properties:
 *               license:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: PDF file only
 *     responses:
 *       201:
 *         description: License added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     license:
 *                       $ref: '#/components/schemas/License'
 *       400:
 *         description: Bad request - Invalid input or license already exists
 *       415:
 *         description: Unsupported Media Type - Document must be PDF
 */
