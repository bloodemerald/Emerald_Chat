import styled from 'styled-components';

const EmeraldChatHeader = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="content">
          <div className="logo">
            <svg viewBox="0 0 160 30" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="22" fontSize="20" fontWeight="700" fill="#10B981" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" letterSpacing="-0.5">
                EMERALD CHAT
              </text>
            </svg>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    height: 60px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    display: flex;
    align-items: center;
  }

  .content .logo {
    height: 30px;
    display: flex;
    align-items: center;
  }

  .content .logo svg {
    height: 100%;
  }
`;

export default EmeraldChatHeader;
