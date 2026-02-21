use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod voting_system {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        description: String,
        start_time: i64,
        end_time: i64,
        options: Vec<String>,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.authority = ctx.accounts.authority.key();
        poll.poll_id = poll_id;
        poll.description = description;
        poll.start_time = start_time;
        poll.end_time = end_time;
        poll.options = options;
        poll.vote_counts = vec![0; poll.options.len()];
        poll.total_votes = 0;
        poll.is_active = true;
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        option_index: u8,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let vote_record = &mut ctx.accounts.vote_record;
        let clock = Clock::get()?;

        require!(poll.is_active, VotingError::PollNotActive);
        require!(
            clock.unix_timestamp >= poll.start_time,
            VotingError::PollNotStarted
        );
        require!(
            clock.unix_timestamp <= poll.end_time,
            VotingError::PollEnded
        );
        require!(
            (option_index as usize) < poll.options.len(),
            VotingError::InvalidOption
        );

        vote_record.voter = ctx.accounts.voter.key();
        vote_record.poll = poll.key();
        vote_record.option_index = option_index;
        vote_record.timestamp = clock.unix_timestamp;

        poll.vote_counts[option_index as usize] += 1;
        poll.total_votes += 1;

        Ok(())
    }

    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(
            poll.authority == ctx.accounts.authority.key(),
            VotingError::Unauthorized
        );
        poll.is_active = false;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Poll::INIT_SPACE,
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Poll {
    pub authority: Pubkey,
    pub poll_id: u64,
    pub description: String,
    pub start_time: i64,
    pub end_time: i64,
    pub options: Vec<String>,
    pub vote_counts: Vec<u64>,
    pub total_votes: u64,
    pub is_active: bool,
}

impl Poll {
    pub const INIT_SPACE: usize = 32 + 8 + 200 + 8 + 8 + 400 + 200 + 8 + 1;
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub poll: Pubkey,
    pub option_index: u8,
    pub timestamp: i64,
}

impl VoteRecord {
    pub const INIT_SPACE: usize = 32 + 32 + 1 + 8;
}

#[error_code]
pub enum VotingError {
    #[msg("Poll is not active")]
    PollNotActive,
    #[msg("Poll has not started yet")]
    PollNotStarted,
    #[msg("Poll has ended")]
    PollEnded,
    #[msg("Invalid option selected")]
    InvalidOption,
    #[msg("Unauthorized action")]
    Unauthorized,
}
