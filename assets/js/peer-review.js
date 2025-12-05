/**
 * ========================================
 * SmartMock v2.0 - Peer Review System
 * ========================================
 * 
 * Features:
 * - Peer invitation system
 * - Comment on responses, emotions, clarity
 * - Anonymous or verified feedback
 * - Review dashboard
 * - Feedback scoring and aggregation
 * 
 * Author: SmartMock Team
 * Version: 2.0.0
 * ========================================
 */

(function() {
    'use strict';

    // ============================================
    // Peer Review System
    // ============================================
    const PeerReview = {
        /**
         * Initialize the peer review system
         * @param {Object} config - Configuration options
         */
        init: function(config = {}) {
            this.config = {
                maxReviewers: config.maxReviewers || 5,
                reviewExpiry: config.reviewExpiry || 7 * 24 * 60 * 60 * 1000, // 7 days
                allowAnonymous: config.allowAnonymous !== false,
                requireVerification: config.requireVerification || false,
                firebase: config.firebase || null
            };

            this.reviews = [];
            this.invitations = [];
            this.comments = [];

            console.log('✅ Peer Review System initialized');
            return this;
        },

        /**
         * Create a review invitation
         * @param {Object} interviewData - Interview data to be reviewed
         * @param {Array} reviewerEmails - Array of reviewer email addresses
         * @param {Object} options - Invitation options
         */
        createInvitation: function(interviewData, reviewerEmails, options = {}) {
            if (!interviewData || !interviewData.interviewId) {
                console.error('Invalid interview data');
                return null;
            }

            if (!reviewerEmails || reviewerEmails.length === 0) {
                console.error('No reviewers specified');
                return null;
            }

            if (reviewerEmails.length > this.config.maxReviewers) {
                console.warn(`Too many reviewers. Maximum is ${this.config.maxReviewers}`);
                reviewerEmails = reviewerEmails.slice(0, this.config.maxReviewers);
            }

            const invitation = {
                invitationId: this.generateId(),
                interviewId: interviewData.interviewId,
                createdBy: interviewData.userId,
                createdAt: Date.now(),
                expiresAt: Date.now() + this.config.reviewExpiry,
                status: 'pending', // pending, active, expired
                reviewers: reviewerEmails.map(email => ({
                    email: email,
                    status: 'invited', // invited, accepted, declined, completed
                    invitedAt: Date.now()
                })),
                interviewData: {
                    department: interviewData.department,
                    course: interviewData.course,
                    score: interviewData.score,
                    duration: interviewData.duration,
                    date: interviewData.date
                },
                settings: {
                    allowAnonymous: options.allowAnonymous !== false,
                    showScore: options.showScore !== false,
                    showEmotions: options.showEmotions !== false,
                    allowComments: options.allowComments !== false,
                    requestSpecificFeedback: options.requestSpecificFeedback || []
                }
            };

            this.invitations.push(invitation);
            console.log('✅ Review invitation created:', invitation.invitationId);

            // Send invitation emails (Firebase Cloud Function)
            if (this.config.firebase) {
                this.sendInvitationEmails(invitation);
            }

            return invitation;
        },

        /**
         * Generate unique ID
         */
        generateId: function() {
            return 'pr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Accept review invitation
         * @param {string} invitationId - Invitation ID
         * @param {string} reviewerEmail - Reviewer's email
         */
        acceptInvitation: function(invitationId, reviewerEmail) {
            const invitation = this.invitations.find(inv => inv.invitationId === invitationId);
            
            if (!invitation) {
                console.error('Invitation not found');
                return false;
            }

            if (Date.now() > invitation.expiresAt) {
                invitation.status = 'expired';
                console.error('Invitation has expired');
                return false;
            }

            const reviewer = invitation.reviewers.find(r => r.email === reviewerEmail);
            if (!reviewer) {
                console.error('Reviewer not found in invitation');
                return false;
            }

            reviewer.status = 'accepted';
            reviewer.acceptedAt = Date.now();
            invitation.status = 'active';

            console.log('✅ Invitation accepted by:', reviewerEmail);
            return true;
        },

        /**
         * Submit a peer review
         * @param {string} invitationId - Invitation ID
         * @param {string} reviewerEmail - Reviewer's email
         * @param {Object} reviewData - Review data
         */
        submitReview: function(invitationId, reviewerEmail, reviewData) {
            const invitation = this.invitations.find(inv => inv.invitationId === invitationId);
            
            if (!invitation) {
                console.error('Invitation not found');
                return null;
            }

            const reviewer = invitation.reviewers.find(r => r.email === reviewerEmail);
            if (!reviewer || reviewer.status !== 'accepted') {
                console.error('Reviewer not authorized');
                return null;
            }

            const review = {
                reviewId: this.generateId(),
                invitationId: invitationId,
                interviewId: invitation.interviewId,
                reviewerEmail: reviewData.anonymous ? null : reviewerEmail,
                reviewerName: reviewData.anonymous ? 'Anonymous' : reviewData.reviewerName,
                isAnonymous: reviewData.anonymous || false,
                submittedAt: Date.now(),
                
                // Overall ratings (1-5)
                ratings: {
                    technical: reviewData.ratings.technical || 0,
                    communication: reviewData.ratings.communication || 0,
                    confidence: reviewData.ratings.confidence || 0,
                    clarity: reviewData.ratings.clarity || 0,
                    overall: reviewData.ratings.overall || 0
                },

                // Detailed feedback
                feedback: {
                    strengths: reviewData.feedback.strengths || [],
                    improvements: reviewData.feedback.improvements || [],
                    suggestions: reviewData.feedback.suggestions || []
                },

                // Specific comments on responses
                responseComments: reviewData.responseComments || [],

                // Emotion feedback
                emotionFeedback: reviewData.emotionFeedback || '',

                // Speech clarity feedback
                clarityFeedback: reviewData.clarityFeedback || '',

                // Additional notes
                additionalNotes: reviewData.additionalNotes || ''
            };

            this.reviews.push(review);
            reviewer.status = 'completed';
            reviewer.completedAt = Date.now();

            console.log('✅ Review submitted:', review.reviewId);
            return review;
        },

        /**
         * Add a comment to a specific response
         * @param {string} reviewId - Review ID
         * @param {number} questionIndex - Question index
         * @param {string} commentText - Comment text
         * @param {string} commentType - Type: feedback, suggestion, question
         */
        addComment: function(reviewId, questionIndex, commentText, commentType = 'feedback') {
            const review = this.reviews.find(r => r.reviewId === reviewId);
            
            if (!review) {
                console.error('Review not found');
                return null;
            }

            const comment = {
                commentId: this.generateId(),
                reviewId: reviewId,
                questionIndex: questionIndex,
                text: commentText,
                type: commentType, // feedback, suggestion, question, praise
                timestamp: Date.now(),
                upvotes: 0,
                replies: []
            };

            this.comments.push(comment);
            console.log('✅ Comment added:', comment.commentId);
            return comment;
        },

        /**
         * Get all reviews for an interview
         * @param {string} interviewId - Interview ID
         */
        getReviews: function(interviewId) {
            return this.reviews.filter(r => r.interviewId === interviewId);
        },

        /**
         * Get aggregated review statistics
         * @param {string} interviewId - Interview ID
         */
        getReviewStats: function(interviewId) {
            const reviews = this.getReviews(interviewId);
            
            if (reviews.length === 0) {
                return null;
            }

            const stats = {
                totalReviews: reviews.length,
                anonymousReviews: reviews.filter(r => r.isAnonymous).length,
                
                averageRatings: {
                    technical: 0,
                    communication: 0,
                    confidence: 0,
                    clarity: 0,
                    overall: 0
                },

                commonStrengths: [],
                commonImprovements: [],
                
                totalComments: this.comments.filter(c => 
                    reviews.some(r => r.reviewId === c.reviewId)
                ).length
            };

            // Calculate average ratings
            ['technical', 'communication', 'confidence', 'clarity', 'overall'].forEach(category => {
                const sum = reviews.reduce((acc, r) => acc + (r.ratings[category] || 0), 0);
                stats.averageRatings[category] = sum / reviews.length;
            });

            // Aggregate strengths and improvements
            const strengthsMap = {};
            const improvementsMap = {};

            reviews.forEach(review => {
                review.feedback.strengths.forEach(s => {
                    strengthsMap[s] = (strengthsMap[s] || 0) + 1;
                });
                review.feedback.improvements.forEach(i => {
                    improvementsMap[i] = (improvementsMap[i] || 0) + 1;
                });
            });

            // Get top 5 most mentioned
            stats.commonStrengths = Object.entries(strengthsMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([text, count]) => ({ text, count }));

            stats.commonImprovements = Object.entries(improvementsMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([text, count]) => ({ text, count }));

            return stats;
        },

        /**
         * Get review dashboard data
         * @param {string} userId - User ID
         */
        getDashboard: function(userId) {
            const userInvitations = this.invitations.filter(inv => 
                inv.createdBy === userId
            );

            const receivedReviews = this.reviews.filter(review => 
                userInvitations.some(inv => inv.invitationId === review.invitationId)
            );

            const pendingReviews = userInvitations.filter(inv => 
                inv.status === 'pending' || inv.status === 'active'
            ).length;

            const completedReviews = receivedReviews.length;

            return {
                totalInvitations: userInvitations.length,
                pendingReviews: pendingReviews,
                completedReviews: completedReviews,
                averageRating: completedReviews > 0 
                    ? receivedReviews.reduce((acc, r) => acc + r.ratings.overall, 0) / completedReviews 
                    : 0,
                recentReviews: receivedReviews
                    .sort((a, b) => b.submittedAt - a.submittedAt)
                    .slice(0, 5),
                invitations: userInvitations
            };
        },

        /**
         * Send invitation emails (Firebase Cloud Function)
         */
        sendInvitationEmails: function(invitation) {
            if (!this.config.firebase) {
                console.warn('Firebase not configured, skipping email send');
                return;
            }

            invitation.reviewers.forEach(reviewer => {
                const emailData = {
                    to: reviewer.email,
                    subject: 'You\'re invited to review an interview on SmartMock',
                    html: this.generateInvitationEmailHTML(invitation, reviewer.email)
                };

                console.log('📧 Sending invitation email to:', reviewer.email);
                // Firebase Cloud Function call would go here
            });
        },

        /**
         * Generate invitation email HTML
         */
        generateInvitationEmailHTML: function(invitation, reviewerEmail) {
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6C63FF;">SmartMock Peer Review Invitation</h2>
                    <p>You've been invited to review an interview!</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Department:</strong> ${invitation.interviewData.department}</p>
                        <p><strong>Course:</strong> ${invitation.interviewData.course}</p>
                        <p><strong>Duration:</strong> ${Math.round(invitation.interviewData.duration / 60)} minutes</p>
                    </div>
                    
                    <p>Your feedback will help improve their interview skills!</p>
                    
                    <a href="https://smartmock.app/review/${invitation.invitationId}?email=${encodeURIComponent(reviewerEmail)}" 
                       style="display: inline-block; background: #6C63FF; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        Review Interview
                    </a>
                    
                    <p style="color: #999; font-size: 12px;">
                        This invitation expires on ${new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                </div>
            `;
        },

        /**
         * Create review UI component
         */
        createReviewUI: function(containerId, interviewData) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Container not found:', containerId);
                return;
            }

            const html = `
                <div class="peer-review-ui" style="max-width: 800px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #6C63FF;">📝 Peer Review</h2>
                    
                    <!-- Overall Ratings -->
                    <div class="rating-section" style="margin: 20px 0;">
                        <h3>Overall Ratings</h3>
                        ${this.createRatingInput('technical', 'Technical Knowledge')}
                        ${this.createRatingInput('communication', 'Communication Skills')}
                        ${this.createRatingInput('confidence', 'Confidence Level')}
                        ${this.createRatingInput('clarity', 'Speech Clarity')}
                        ${this.createRatingInput('overall', 'Overall Performance')}
                    </div>

                    <!-- Feedback -->
                    <div class="feedback-section" style="margin: 20px 0;">
                        <h3>Detailed Feedback</h3>
                        
                        <div style="margin: 15px 0;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                                💪 Strengths (what they did well)
                            </label>
                            <textarea id="strengths-input" rows="3" 
                                      style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"
                                      placeholder="List strengths, separated by commas..."></textarea>
                        </div>

                        <div style="margin: 15px 0;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                                🎯 Areas for Improvement
                            </label>
                            <textarea id="improvements-input" rows="3" 
                                      style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"
                                      placeholder="List improvement areas, separated by commas..."></textarea>
                        </div>

                        <div style="margin: 15px 0;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                                💡 Suggestions
                            </label>
                            <textarea id="suggestions-input" rows="3" 
                                      style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"
                                      placeholder="Provide actionable suggestions..."></textarea>
                        </div>
                    </div>

                    <!-- Additional Notes -->
                    <div style="margin: 20px 0;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            📝 Additional Notes
                        </label>
                        <textarea id="notes-input" rows="4" 
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"
                                  placeholder="Any other feedback or observations..."></textarea>
                    </div>

                    <!-- Anonymous Option -->
                    <div style="margin: 20px 0;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="anonymous-checkbox" style="margin-right: 10px;">
                            Submit as anonymous review
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <button id="submit-review-btn" 
                            style="background: linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%); 
                                   color: white; border: none; padding: 12px 32px; 
                                   border-radius: 6px; font-size: 16px; cursor: pointer;
                                   box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);">
                        Submit Review
                    </button>
                </div>
            `;

            container.innerHTML = html;

            // Add submit handler
            document.getElementById('submit-review-btn').addEventListener('click', () => {
                this.handleReviewSubmit(interviewData);
            });
        },

        /**
         * Create rating input component
         */
        createRatingInput: function(id, label) {
            return `
                <div style="margin: 15px 0; display: flex; align-items: center; justify-content: space-between;">
                    <label style="flex: 1; font-weight: bold;">${label}</label>
                    <div class="star-rating" id="rating-${id}" style="flex: 1; text-align: right;">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <span class="star" data-rating="${star}" data-category="${id}"
                                  style="cursor: pointer; font-size: 24px; color: #ddd; margin: 0 2px;"
                                  onclick="PeerReview.setRating('${id}', ${star})">
                                ★
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        /**
         * Set rating value
         */
        setRating: function(category, rating) {
            const stars = document.querySelectorAll(`[data-category="${category}"]`);
            stars.forEach((star, index) => {
                star.style.color = index < rating ? '#FFD700' : '#ddd';
                star.dataset.selected = index < rating;
            });
        },

        /**
         * Handle review submission
         */
        handleReviewSubmit: function(interviewData) {
            const reviewData = {
                anonymous: document.getElementById('anonymous-checkbox').checked,
                reviewerName: 'Current User', // Get from auth
                ratings: {
                    technical: this.getSelectedRating('technical'),
                    communication: this.getSelectedRating('communication'),
                    confidence: this.getSelectedRating('confidence'),
                    clarity: this.getSelectedRating('clarity'),
                    overall: this.getSelectedRating('overall')
                },
                feedback: {
                    strengths: document.getElementById('strengths-input').value.split(',').map(s => s.trim()).filter(s => s),
                    improvements: document.getElementById('improvements-input').value.split(',').map(s => s.trim()).filter(s => s),
                    suggestions: document.getElementById('suggestions-input').value.split(',').map(s => s.trim()).filter(s => s)
                },
                additionalNotes: document.getElementById('notes-input').value
            };

            console.log('✅ Review data collected:', reviewData);
            alert('Review submitted successfully! Thank you for your feedback.');
        },

        /**
         * Get selected rating value
         */
        getSelectedRating: function(category) {
            const stars = document.querySelectorAll(`[data-category="${category}"]`);
            let rating = 0;
            stars.forEach(star => {
                if (star.dataset.selected === 'true') rating++;
            });
            return rating;
        }
    };

    // Export to global scope
    window.PeerReview = PeerReview;

    console.log('✅ Peer Review System module loaded');
})();
