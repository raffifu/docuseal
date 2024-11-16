class ReportDashboardController < ApplicationController
  skip_authorization_check
  skip_before_action :authenticate_user!, only: [:index]
  def index; end
end
